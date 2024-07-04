const fb = require('../utils/facebook');
const config = require('../config');

const axios = require('axios');

async function getPageId(pageUsername, accessToken) {
    const url = `https://graph.facebook.com/v12.0/${pageUsername}?fields=id&access_token=${accessToken}`;
    try {
        const response = await axios.get(url);
        return response.data.id;
    } catch (error) {
        console.error("Error fetching Page ID:", error);
        return null;
    }
}

const club = [
    { name : "HCMUS Football Club", description: "Trang thông tin chính thức của CLB Bóng Đá Trường ĐH Khoa Học Tự Nhiên - ĐHQG HCM.", link: "https://www.facebook.com/HCMUSFC" },
    { name : "CLB Cờ Trường ĐH Khoa học tự nhiên, ĐHQG - HCM", description: "Trang thông tin chính thức của CLB Cờ Trường ĐH Khoa học tự nhiên, ĐHQG - HCM.", link: "https://www.facebook.com/hcmuschessclub" },
    
];

async function fetchImageUrl(pageId, accessToken) {
    const url = `https://graph.facebook.com/v12.0/${pageId}/picture?type=large&redirect=false&access_token=${accessToken}`;
    try {
        const response = await axios.get(url);
        return response.data.data.url;
    } catch (error) {
        console.error("Failed to fetch image URL", error);
        return null;
    }
}

async function suggestClub(sender) {
    const elements = await Promise.all(club.map(async club => {
        const pageUsername = club.link.split('https://www.facebook.com/')[1];
        const pageId = await getPageId(pageUsername, config.ACCESS_TOKEN_TEST_IMAGE);
        const imageUrl = await fetchImageUrl(pageId, config.ACCESS_TOKEN_TEST_IMAGE); 
        return {
            title: club.name,
            subtitle: club.description,
            image_url: imageUrl,
            buttons: [
                {
                    type: 'web_url',
                    url: club.link,
                    title: 'Xem trên Facebook',
                },
            ],
        }
    }));
    const payload = {
        template_type: 'generic',
        elements,
    };
    await fb.sendAttachment('', sender, 'template', payload, false, false, false);
}

module.exports = {
    suggestClub,
};