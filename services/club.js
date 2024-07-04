
const club = [
    { name : "HCMUS Football Club", description: "Trang thông tin chính thức của CLB Bóng Đá Trường ĐH Khoa Học Tự Nhiên - ĐHQG HCM.", link: "https://www.facebook.com/HCMUSFC" },
    { name : "CLB Cờ Trường ĐH Khoa học tự nhiên, ĐHQG - HCM", description: "Trang thông tin chính thức của CLB Cờ Trường ĐH Khoa học tự nhiên, ĐHQG - HCM.", link: "https://www.facebook.com/hcmuschessclub" },
    
];

async function suggestClub(sender) {
    const randomClub = club[Math.floor(Math.random() * club.length)];
    const message = `CLB bạn có thể tham gia: ${randomClub.name} - ${randomClub.description}.\nXem thêm tại: ${randomClub.link}`;
    await fb.sendTextMessage('', sender, message, false);
}

module.exports = {
    suggestClub,
};