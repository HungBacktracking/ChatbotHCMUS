const crypto = require('crypto');
const config = require('../config');

const verifyXHub = (req, res, next) => {
    if (config.APP_SECRET === '') {
        next();
        return;
    }

    const rawBody = req.rawBody;

    const sig = req.get('X-Hub-Signature') || '';
    const hmac = crypto.createHmac('sha1', config.APP_SECRET);
    const digest = Buffer.from('sha1=' + hmac.update(rawBody).digest('hex'), 'utf8');
    const checksum = Buffer.from(sig, 'utf8');
    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        res.status(403).send('Invalid signature');
        return;
    }
    next();
};

module.exports = verifyXHub;
