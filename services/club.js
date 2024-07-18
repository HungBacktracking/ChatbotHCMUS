const fb = require('../utils/facebook');
// const config = require('../config');

// const axios = require('axios');

// async function getPageId(pageUsername, accessToken) {
//     const url = `https://graph.facebook.com/v12.0/${pageUsername}?fields=id&access_token=${accessToken}`;
//     try {
//         const response = await axios.get(url);
//         return response.data.id;
//     } catch (error) {
//         console.error("Error fetching Page ID:", error);
//         return null;
//     }
// }

const club = [
    { 
        name : "HCMUS Football Club", 
        description: "Trang thông tin chính thức của CLB Bóng Đá Trường ĐH Khoa Học Tự Nhiên - ĐHQG HCM.", 
        link: "https://www.facebook.com/HCMUSFC",
        imgUrl: "https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-6/299209521_521390573121903_5663329464766273592_n.png?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=_05hesmaMN8Q7kNvgGbUgDr&_nc_ht=scontent.fsgn8-4.fna&gid=AbIxudNEup373kHTgtifNlD&oh=00_AYCuxAsL2yHVvh-FrntM3HXTNDeSM24kg3B2F8VPgi-Zbg&oe=668D666E" 
    },
    { 
        name : "CLB Cờ Trường ĐH Khoa học tự nhiên, ĐHQG - HCM", 
        description: "Trang thông tin chính thức của CLB Cờ Trường ĐH Khoa học tự nhiên, ĐHQG - HCM.", 
        link: "https://www.facebook.com/hcmuschessclub",
        imgUrl: "https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-6/391409041_228217483602353_429738941460499390_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=XhP7ASRaSaQQ7kNvgFb8GnO&_nc_ht=scontent.fsgn8-4.fna&oh=00_AYDH4oiaRyU_Da08p62e3I9xUeuGcTmpmPq4rgeN2kUHVQ&oe=668D585B" 
    },
    
];

// async function fetchImageUrl(pageId, accessToken) {
//     const url = `https://graph.facebook.com/v12.0/${pageId}/picture?type=large&redirect=false&access_token=${accessToken}`;
//     try {
//         const response = await axios.get(url);
//         return response.data.data.url;
//     } catch (error) {
//         console.error("Failed to fetch image URL", error);
//         return null;
//     }
// }

async function suggestClub(sender) {
    const elements = await Promise.all(club.map(async club => {

        // const pageUsername = club.link.split('https://www.facebook.com/')[1];
        // const pageId = await getPageId(pageUsername, config.ACCESS_TOKEN);
        // const imageUrl = await fetchImageUrl(pageId, config.ACCESS_TOKEN); 
        
        return {
            title: club.name,
            subtitle: club.description,
            image_url: club.imgUrl,
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