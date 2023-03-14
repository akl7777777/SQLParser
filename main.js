const { app, BrowserWindow, ipcMain, shell} = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 800,
        // 在渲染进程中使用node, 需要要配置webPreferences属性
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            contextIsolation: false,  //Electron 12.0以上版本需要的额外设置此项
            webviewTag: true
        }
    })
    win.loadFile('index.html')
}

// 监听渲染进程发送的事件
ipcMain.on('parse-sql', (event, sql) => {
    const replaceSql = parseSql(sql);
    event.sender.send('parsed-sql', replaceSql);
});

ipcMain.on('homepage', (event) => {
    shell.openExternal('https://github.com/akl7777777');
})
ipcMain.on('donate', (event) => {
    shell.openExternal('https://afdian.net/a/akl7777777');
})

// 解析SQL语句
function parseSql(rawLog) {
    // const rawLog = `==> Preparing: INSERT INTO sep_audit_module ( id, user_name, request_url, request_time, method, module_name, is_succeed, request_duration ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? ) 2023-03-13 16:13:37.241 [SimpleAsyncTaskExecutor-11] DEBUG com.dhcc.sep.system.dao.AuditMapper.insert - ==> Parameters: f84ef6134260a4071dd16842f787e642(String), 957f22cfc25949b2aa85e4c01fbd0b4c(String), http://10.2.1.31:18001/sep/service/deviceMerge/getDeviceMergeList(String), 2023-03-13 16:13:37 176(String), GET(String), sep(String), true(Boolean), 54(Long) 2023-03-13 16:13:37.294`;
    console.log(rawLog)
// 从日志中提取出SQL语句和参数
    let split = rawLog.split('\n');
    let sql = split[0].match(/==>\s+Preparing: (.+)/)[1];
    let paramsStr = split[1].match(/==>\s+Parameters: (.+)/)[1];

    // 解析参数
    const params = [];
    paramsStr.split(', ').forEach(paramStr => {
        const [value, type] = paramStr.split('(');
        if (type === 'String)') {
            params.push(value);
        } else if (type === 'Boolean)') {
            params.push(value === 'true');
        } else if (type === 'Long)') {
            params.push(parseInt(value));
        } else {
            params.push(value);
        }
    });
    console.log('@@@@',params )


// 将参数替换到SQL语句中
    const replacedSQL = sql.replace(/\?/g, param => {
        const value = params.shift();
        if (typeof value === 'string') {
            return `'${value}'`;
        }
        return value;
    });

    console.log(replacedSQL);

    return replacedSQL
}


app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})