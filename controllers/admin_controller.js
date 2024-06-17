const Admin = require('../services/admin');
const config = require('../config');

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
    editChatRoom,
    resetDatabase,
    getUserData,
    getAuth,
    readChatRoom,
    readWaitRoom,
    readStats,
    createBackup,
    restoreBackup,
    getVersion
};
