const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const HISTORY_KEY = 'apiBuddy.requestHistory';
const SAVED_APIS_KEY = 'apiBuddy.savedApis';

function activate(context) {

    let requestHistory =
        context.globalState.get(HISTORY_KEY, []);

    let savedApis =
        context.globalState.get(SAVED_APIS_KEY, []);


    // ==========================================
    // TEST API
    // ==========================================

    const testApiCommand =
        vscode.commands.registerCommand(
            'apiBuddy.testApi',
            async function () {

                const url =
                    await vscode.window.showInputBox({
                        prompt: 'Enter API URL'
                    });

                if (!url) return;


                const method =
                    await vscode.window.showQuickPick(
                        [
                            'GET',
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE'
                        ],
                        {
                            placeHolder:
                                'Select HTTP method'
                        }
                    );

                if (!method) return;


                const headerInput =
                    await vscode.window.showInputBox({
                        prompt:
                            'Enter header (optional)',
                        placeHolder:
                            'Authorization: Bearer abc123'
                    });


                const headers = {};


                if (headerInput) {

                    const separatorIndex =
                        headerInput.indexOf(':');


                    if (separatorIndex === -1) {

                        vscode.window.showErrorMessage(
                            'Invalid header format. Use: Key: Value'
                        );

                        return;
                    }


                    const key =
                        headerInput
                            .substring(
                                0,
                                separatorIndex
                            )
                            .trim();


                    const value =
                        headerInput
                            .substring(
                                separatorIndex + 1
                            )
                            .trim();


                    headers[key] = value;
                }


                let body;


                if (
                    ['POST', 'PUT', 'PATCH']
                        .includes(method)
                ) {

                    body =
                        await vscode.window.showInputBox({
                            prompt:
                                'Enter JSON request body',
                            placeHolder:
                                '{"name":"Shraddha","role":"Developer"}'
                        });


                    if (body) {

                        try {

                            JSON.parse(body);

                        } catch {

                            vscode.window.showErrorMessage(
                                'Invalid JSON body'
                            );

                            return;
                        }


                        headers['Content-Type'] =
                            'application/json';
                    }
                }


                await sendRequest(
                    url,
                    method,
                    headers,
                    body,
                    context,
                    requestHistory
                );


                requestHistory =
                    context.globalState.get(
                        HISTORY_KEY,
                        []
                    );
            }
        );


    // ==========================================
    // SHOW HISTORY
    // ==========================================

    const historyCommand =
        vscode.commands.registerCommand(
            'apiBuddy.showHistory',
            function () {

                const output =
                    vscode.window.createOutputChannel(
                        'API Buddy History'
                    );


                output.clear();


                output.appendLine(
                    '================================'
                );

                output.appendLine(
                    '        API REQUEST HISTORY'
                );

                output.appendLine(
                    '================================'
                );

                output.appendLine('');


                if (requestHistory.length === 0) {

                    output.appendLine(
                        'No requests have been made yet.'
                    );

                } else {

                    requestHistory.forEach(
                        (request, index) => {

                            output.appendLine(
                                `${index + 1}. ${request.method} ${request.url}`
                            );

                            output.appendLine(
                                `   Status: ${request.status}`
                            );

                            output.appendLine(
                                `   Response Time: ${request.responseTime} ms`
                            );

                            output.appendLine(
                                `   Time: ${request.timestamp}`
                            );

                            output.appendLine('');
                        }
                    );
                }


                output.show();
            }
        );


    // ==========================================
    // SAVE API
    // ==========================================

    const saveApiCommand =
        vscode.commands.registerCommand(
            'apiBuddy.saveApi',
            async function () {

                const name =
                    await vscode.window.showInputBox({
                        prompt:
                            'Enter a name for this API',
                        placeHolder:
                            'Get Users'
                    });

                if (!name) return;


                const url =
                    await vscode.window.showInputBox({
                        prompt:
                            'Enter API URL'
                    });

                if (!url) return;


                const method =
                    await vscode.window.showQuickPick(
                        [
                            'GET',
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE'
                        ],
                        {
                            placeHolder:
                                'Select HTTP method'
                        }
                    );

                if (!method) return;


                const savedApi = {

                    name:
                        name,

                    url:
                        url,

                    method:
                        method

                };


                savedApis.push(
                    savedApi
                );


                await context.globalState.update(
                    SAVED_APIS_KEY,
                    savedApis
                );


                vscode.window.showInformationMessage(
                    `API "${name}" saved successfully!`
                );
            }
        );


    // ==========================================
    // RUN SAVED API
    // ==========================================

    const runSavedApiCommand =
        vscode.commands.registerCommand(
            'apiBuddy.runSavedApi',
            async function () {

                savedApis =
                    context.globalState.get(
                        SAVED_APIS_KEY,
                        []
                    );


                if (savedApis.length === 0) {

                    vscode.window.showInformationMessage(
                        'No saved APIs found. Save an API first.'
                    );

                    return;
                }


                const selected =
                    await vscode.window.showQuickPick(
                        savedApis.map(api => ({

                            label:
                                api.name,

                            description:
                                `${api.method} ${api.url}`,

                            api:
                                api

                        })),
                        {
                            placeHolder:
                                'Select a saved API'
                        }
                    );


                if (!selected) return;


                const api =
                    selected.api;


                await sendRequest(
                    api.url,
                    api.method,
                    {},
                    undefined,
                    context,
                    requestHistory
                );


                requestHistory =
                    context.globalState.get(
                        HISTORY_KEY,
                        []
                    );
            }
        );


    // ==========================================
    // DELETE SAVED API
    // ==========================================

    const deleteSavedApiCommand =
        vscode.commands.registerCommand(
            'apiBuddy.deleteSavedApi',
            async function () {

                savedApis =
                    context.globalState.get(
                        SAVED_APIS_KEY,
                        []
                    );


                if (savedApis.length === 0) {

                    vscode.window.showInformationMessage(
                        'No saved APIs found.'
                    );

                    return;
                }


                const selected =
                    await vscode.window.showQuickPick(
                        savedApis.map(
                            (api, index) => ({

                                label:
                                    api.name,

                                description:
                                    `${api.method} ${api.url}`,

                                index:
                                    index

                            })
                        ),
                        {
                            placeHolder:
                                'Select an API to delete'
                        }
                    );


                if (!selected) {
                    return;
                }


                const api =
                    savedApis[
                        selected.index
                    ];


                const confirmation =
                    await vscode.window.showWarningMessage(
                        `Delete "${api.name}"?`,
                        'Yes',
                        'No'
                    );


                if (confirmation !== 'Yes') {
                    return;
                }


                savedApis.splice(
                    selected.index,
                    1
                );


                await context.globalState.update(
                    SAVED_APIS_KEY,
                    savedApis
                );


                vscode.window.showInformationMessage(
                    `API "${api.name}" deleted successfully.`
                );
            }
        );


    // ==========================================
    // EDIT SAVED API
    // ==========================================

    const editSavedApiCommand =
        vscode.commands.registerCommand(
            'apiBuddy.editSavedApi',
            async function () {

                savedApis =
                    context.globalState.get(
                        SAVED_APIS_KEY,
                        []
                    );


                if (savedApis.length === 0) {

                    vscode.window.showInformationMessage(
                        'No saved APIs found.'
                    );

                    return;
                }


                const selected =
                    await vscode.window.showQuickPick(
                        savedApis.map(
                            (api, index) => ({

                                label:
                                    api.name,

                                description:
                                    `${api.method} ${api.url}`,

                                index:
                                    index

                            })
                        ),
                        {
                            placeHolder:
                                'Select an API to edit'
                        }
                    );


                if (!selected) {
                    return;
                }


                const api =
                    savedApis[
                        selected.index
                    ];


                const newName =
                    await vscode.window.showInputBox({

                        prompt:
                            'Enter API name',

                        value:
                            api.name

                    });


                if (!newName) {
                    return;
                }


                const newUrl =
                    await vscode.window.showInputBox({

                        prompt:
                            'Enter API URL',

                        value:
                            api.url

                    });


                if (!newUrl) {
                    return;
                }


                const newMethod =
                    await vscode.window.showQuickPick(
                        [
                            'GET',
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE'
                        ],
                        {
                            placeHolder:
                                'Select HTTP method'
                        }
                    );


                if (!newMethod) {
                    return;
                }


                savedApis[
                    selected.index
                ] = {

                    name:
                        newName,

                    url:
                        newUrl,

                    method:
                        newMethod

                };


                await context.globalState.update(
                    SAVED_APIS_KEY,
                    savedApis
                );


                vscode.window.showInformationMessage(
                    `API "${newName}" updated successfully!`
                );
            }
        );


    // ==========================================
    // OPEN API BUDDY UI
    // ==========================================

    const openUiCommand =
        vscode.commands.registerCommand(
            'apiBuddy.openUI',
            function () {

                const panel =
                    vscode.window.createWebviewPanel(
                        'apiBuddy',
                        'API Buddy',
                        vscode.ViewColumn.One,
                        {
                            enableScripts: true
                        }
                    );


                const htmlPath =
                    path.join(
                        context.extensionPath,
                        'ui.html'
                    );


                panel.webview.html =
                    fs.readFileSync(
                        htmlPath,
                        'utf8'
                    );


                // ==========================================
                // RECEIVE MESSAGES FROM UI
                // ==========================================

                panel.webview.onDidReceiveMessage(
                    async (message) => {


                        // ==========================================
                        // GET SAVED APIs
                        // ==========================================

                        if (
                            message.command ===
                            'getSavedApis'
                        ) {

                            savedApis =
                                context.globalState.get(
                                    SAVED_APIS_KEY,
                                    []
                                );


                            panel.webview.postMessage({

                                command:
                                    'savedApis',

                                apis:
                                    savedApis

                            });


                            return;
                        }


                        // ==========================================
                        // RUN SAVED API FROM UI
                        // ==========================================

                        if (
                            message.command ===
                            'runSavedApi'
                        ) {

                            savedApis =
                                context.globalState.get(
                                    SAVED_APIS_KEY,
                                    []
                                );


                            const api =
                                savedApis[
                                    message.index
                                ];


                            if (!api) {

                                panel.webview.postMessage({

                                    command:
                                        'error',

                                    message:
                                        'Saved API not found.'

                                });

                                return;
                            }


                            panel.webview.postMessage({

                                command:
                                    'loadSavedApi',

                                api:
                                    api

                            });


                            await sendRequest(

                                api.url,

                                api.method,

                                {},

                                undefined,

                                context,

                                requestHistory,

                                panel

                            );


                            requestHistory =
                                context.globalState.get(
                                    HISTORY_KEY,
                                    []
                                );


                            return;
                        }


                        // ==========================================
                        // SAVE API FROM UI
                        // ==========================================

                        if (
                            message.command ===
                            'saveApiFromUI'
                        ) {

                            const name =
                                await vscode.window.showInputBox({

                                    prompt:
                                        'Enter a name for this API',

                                    placeHolder:
                                        'Get Users'

                                });


                            if (!name) {
                                return;
                            }


                            savedApis =
                                context.globalState.get(
                                    SAVED_APIS_KEY,
                                    []
                                );


                            const savedApi = {

                                name:
                                    name,

                                url:
                                    message.url,

                                method:
                                    message.method

                            };


                            savedApis.push(
                                savedApi
                            );


                            await context.globalState.update(
                                SAVED_APIS_KEY,
                                savedApis
                            );


                            panel.webview.postMessage({

                                command:
                                    'savedApis',

                                apis:
                                    savedApis

                            });


                            panel.webview.postMessage({

                                command:
                                    'apiSaved',

                                name:
                                    name

                            });


                            vscode.window.showInformationMessage(
                                `API "${name}" saved successfully!`
                            );


                            return;
                        }


                        // ==========================================
                        // EDIT SAVED API FROM UI
                        // ==========================================

                        if (
                            message.command ===
                            'editSavedApiFromUI'
                        ) {

                            savedApis =
                                context.globalState.get(
                                    SAVED_APIS_KEY,
                                    []
                                );


                            const index =
                                message.index;


                            const api =
                                savedApis[index];


                            if (!api) {

                                panel.webview.postMessage({

                                    command:
                                        'error',

                                    message:
                                        'Saved API not found.'

                                });

                                return;
                            }


                            const newName =
                                await vscode.window.showInputBox({

                                    prompt:
                                        'Enter API name',

                                    value:
                                        api.name

                                });


                            if (!newName) {
                                return;
                            }


                            const newUrl =
                                await vscode.window.showInputBox({

                                    prompt:
                                        'Enter API URL',

                                    value:
                                        api.url

                                });


                            if (!newUrl) {
                                return;
                            }


                            const newMethod =
                                await vscode.window.showQuickPick(
                                    [
                                        'GET',
                                        'POST',
                                        'PUT',
                                        'PATCH',
                                        'DELETE'
                                    ],
                                    {
                                        placeHolder:
                                            'Select HTTP method'
                                    }
                                );


                            if (!newMethod) {
                                return;
                            }


                            savedApis[index] = {

                                name:
                                    newName,

                                url:
                                    newUrl,

                                method:
                                    newMethod

                            };


                            await context.globalState.update(
                                SAVED_APIS_KEY,
                                savedApis
                            );


                            panel.webview.postMessage({

                                command:
                                    'savedApis',

                                apis:
                                    savedApis

                            });


                            panel.webview.postMessage({

                                command:
                                    'apiSaved',

                                name:
                                    `${newName} updated`

                            });


                            vscode.window.showInformationMessage(
                                `API "${newName}" updated successfully!`
                            );


                            return;
                        }


                        // ==========================================
                        // DELETE SAVED API FROM UI
                        // ==========================================

                        if (
                            message.command ===
                            'deleteSavedApiFromUI'
                        ) {

                            savedApis =
                                context.globalState.get(
                                    SAVED_APIS_KEY,
                                    []
                                );


                            const index =
                                message.index;


                            const api =
                                savedApis[index];


                            if (!api) {

                                panel.webview.postMessage({

                                    command:
                                        'error',

                                    message:
                                        'Saved API not found.'

                                });

                                return;
                            }


                            const confirmation =
                                await vscode.window.showWarningMessage(
                                    `Delete "${api.name}"?`,
                                    'Yes',
                                    'No'
                                );


                            if (
                                confirmation !==
                                'Yes'
                            ) {

                                return;
                            }


                            savedApis.splice(
                                index,
                                1
                            );


                            await context.globalState.update(
                                SAVED_APIS_KEY,
                                savedApis
                            );


                            panel.webview.postMessage({

                                command:
                                    'savedApis',

                                apis:
                                    savedApis

                            });


                            panel.webview.postMessage({

                                command:
                                    'apiSaved',

                                name:
                                    `${api.name} deleted`

                            });


                            vscode.window.showInformationMessage(
                                `API "${api.name}" deleted successfully.`
                            );


                            return;
                        }


                        // ==========================================
                        // SEND REQUEST FROM UI
                        // ==========================================

                        if (
                            message.command ===
                            'sendRequest'
                        ) {

                            try {

                                const headers = {};


                                // ------------------------------
                                // Parse headers
                                // ------------------------------

                                if (
                                    message.headers
                                ) {

                                    try {

                                        Object.assign(
                                            headers,
                                            JSON.parse(
                                                message.headers
                                            )
                                        );

                                    } catch {

                                        panel.webview.postMessage({

                                            command:
                                                'error',

                                            message:
                                                'Invalid headers JSON'

                                        });

                                        return;
                                    }
                                }


                                // ------------------------------
                                // Parse body
                                // ------------------------------

                                let body;


                                if (
                                    [
                                        'POST',
                                        'PUT',
                                        'PATCH'
                                    ].includes(
                                        message.method
                                    )
                                    &&
                                    message.body
                                ) {

                                    try {

                                        JSON.parse(
                                            message.body
                                        );


                                        body =
                                            message.body;


                                        headers[
                                            'Content-Type'
                                        ] =
                                            'application/json';


                                    } catch {

                                        panel.webview.postMessage({

                                            command:
                                                'error',

                                            message:
                                                'Invalid JSON request body'

                                        });

                                        return;
                                    }
                                }


                                // ------------------------------
                                // Send request
                                // ------------------------------

                                await sendRequest(

                                    message.url,

                                    message.method,

                                    headers,

                                    body,

                                    context,

                                    requestHistory,

                                    panel

                                );


                                requestHistory =
                                    context.globalState.get(
                                        HISTORY_KEY,
                                        []
                                    );


                            } catch (error) {

                                panel.webview.postMessage({

                                    command:
                                        'error',

                                    message:
                                        error.message

                                });

                            }
                        }

                    }
                );

            }
        );


    // ==========================================
    // REGISTER COMMANDS
    // ==========================================

    context.subscriptions.push(

        testApiCommand,

        historyCommand,

        saveApiCommand,

        runSavedApiCommand,

        deleteSavedApiCommand,

        editSavedApiCommand,

        openUiCommand

    );

}


// ==========================================
// FORMAT RESPONSE HEADERS
// ==========================================

function formatResponseHeaders(headers) {

    let result = '';


    for (
        const [key, value]
        of headers.entries()
    ) {

        result +=
            `${key}: ${value}\n`;
    }


    return result ||
        'No response headers';
}


// ==========================================
// SEND API REQUEST
// ==========================================

async function sendRequest(

    url,

    method,

    headers,

    body,

    context,

    requestHistory,

    panel = null

) {

    try {

        const startTime =
            Date.now();


        const response =
            await fetch(
                url,
                {
                    method:
                        method,

                    headers:
                        headers,

                    body:
                        body
                }
            );


        const responseTime =
            Date.now() -
            startTime;


        const text =
            await response.text();


        let formattedResponse;


        try {

            const data =
                JSON.parse(text);


            formattedResponse =
                JSON.stringify(
                    data,
                    null,
                    2
                );

        } catch {

            formattedResponse =
                text;

        }


        // ==========================================
        // SEND RESPONSE TO WEBVIEW
        // ==========================================

        if (panel) {

            panel.webview.postMessage({

                command:
                    'response',

                status:
                    `${response.status} ${response.statusText}`,

                responseTime:
                    responseTime,

                headers:
                    formatResponseHeaders(
                        response.headers
                    ),

                data:
                    formattedResponse

            });

        }


        // ==========================================
        // SAVE HISTORY
        // ==========================================

        const historyItem = {

            method:
                method,

            url:
                url,

            status:
                response.status,

            responseTime:
                responseTime,

            timestamp:
                new Date().toLocaleString()

        };


        requestHistory.unshift(
            historyItem
        );


        if (
            requestHistory.length > 10
        ) {

            requestHistory.pop();

        }


        await context.globalState.update(

            HISTORY_KEY,

            requestHistory

        );


        // ==========================================
        // DISPLAY RESPONSE IN OUTPUT
        // ==========================================

        const output =
            vscode.window.createOutputChannel(
                'API Buddy'
            );


        output.clear();


        output.appendLine(
            '================================'
        );


        output.appendLine(
            '          API BUDDY'
        );


        output.appendLine(
            '================================'
        );


        output.appendLine('');


        output.appendLine(
            `Method: ${method}`
        );


        output.appendLine(
            `URL: ${url}`
        );


        output.appendLine(
            `Status: ${response.status} ${response.statusText}`
        );


        output.appendLine(
            `Response Time: ${responseTime} ms`
        );


        output.appendLine('');


        output.appendLine(
            'Response:'
        );


        output.appendLine(
            '--------------------------------'
        );


        output.appendLine(
            formattedResponse
        );


        output.appendLine(
            '--------------------------------'
        );


        output.show();


    } catch (error) {

        if (panel) {

            panel.webview.postMessage({

                command:
                    'error',

                message:
                    error.message

            });

        }


        vscode.window.showErrorMessage(

            `API request failed: ${error.message}`

        );

    }

}


// ==========================================
// DEACTIVATE
// ==========================================

function deactivate() {}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    activate,

    deactivate

};