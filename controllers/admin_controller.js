const Admin = require('../services/admin');
const config = require('../config');

const sentBroadcast = async (req, res) => {
    const content = req.body.content;
    res.send(await Admin.sentBroadcast(content));
}

const editChatRoom = async (req, res) => {
    const data = req.body;
    let ret = { success: false, error: true };
    if (data.type === 'match') {
        ret = await Admin.forceMatch(data.id1, data.id2, data.gender1, data.gender2);
    } else if (data.type === 'remove') {
        ret = await Admin.forceRemove(data.id);
    }
    res.send(ret);
};

const editPrompts = async (req, res) => {
    const data = req.body;
    let ret = { success: false, error: true };
    ret = await Admin.addPrompt(data.prompt);
    // if (data.type === 'add') {
    //     ret = await Admin.addPrompt(data.prompt);
    // } else if (data.type === 'remove') {
    //     ret = await Admin.removePrompt(data.prompt);
    // }
    res.send(ret);
}

const resetDatabase = async (req, res) => {
    res.send(await Admin.resetDatabase());
};

const getUserData = async (req, res) => {
    res.send(await Admin.getUserData(req.body.id));
};

const getAuth = (req, res) => {
    res.send({ success: true, version: config.VERSION });
};

const readChatRoom = async (req, res) => {
    res.send(await Admin.readChatRoom());
};

const readWaitRoom = async (req, res) => {
    res.send(await Admin.readWaitRoom());
};

const readPrompts = async (req, res) => {
    res.send(await Admin.readPrompts());
}

const readStats = async (req, res) => {
    res.send(await Admin.readStats());
};

const createBackup = async (req, res) => {
    res.send(await Admin.createBackup());
};

const restoreBackup = async (req, res) => {
    res.send(await Admin.restoreBackup(req.body));
};

const getVersion = (req, res) => {
    res.send(config.VERSION);
};

module.exports = {
    sentBroadcast,
    editChatRoom,
    resetDatabase,
    getUserData,
    getAuth,
    readChatRoom,
    readWaitRoom,
    readPrompts,
    editPrompts,
    readStats,
    createBackup,
    restoreBackup,
    getVersion
};
