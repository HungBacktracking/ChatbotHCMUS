const fb = require('../utils/facebook');

const club = [
    { name : "HCMUS Football Club", description: "Trang thông tin chính thức của CLB Bóng Đá Trường ĐH Khoa Học Tự Nhiên - ĐHQG HCM.", link: "https://www.facebook.com/HCMUSFC" },
    { name : "CLB Cờ Trường ĐH Khoa học tự nhiên, ĐHQG - HCM", description: "Trang thông tin chính thức của CLB Cờ Trường ĐH Khoa học tự nhiên, ĐHQG - HCM.", link: "https://www.facebook.com/hcmuschessclub" },
    
];

async function suggestClub(sender) {
    for (let i = 0; i < club.length; i++) {
        const templateMessageData = {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: [
                        {
                            title: club[i].name,
                            subtitle: club[i].description,
                            buttons: [
                                {
                                    type: 'web_url',
                                    url: club[i].link,
                                    title: 'Xem thêm',
                                },
                            ],
                        },
                    ],
                },
            },
        };
        
        const messageString = JSON.stringify(templateMessageData);
        const message = Buffer.from(messageString, 'utf8').toString();

        await fb.sendTextMessage('', sender, message, false);
    }
}

module.exports = {
    suggestClub,
};