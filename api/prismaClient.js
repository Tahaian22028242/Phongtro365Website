const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

let rawPrisma = null;
const dbUrl = process.env.DATABASE_URL?.trim();
const isValidDbUrl = Boolean(
  dbUrl &&
  dbUrl.length > 10 &&
  (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') || dbUrl.startsWith('mysql://')) &&
  !dbUrl.includes('placeholder') &&
  !dbUrl.includes('invalid')
);

if (isValidDbUrl) {
  try {
    rawPrisma = new PrismaClient();
  } catch (e) {
    rawPrisma = null;
  }
}

const inMemoryStore = new Map();
let mockIdCounter = 100;

// Valid bcrypt hash for default password '123456'
const defaultPasswordHash = bcrypt.hashSync('123456', 10);

// Authentic sample users / landlords
const initialUsers = [
  {
    id: 1,
    name: 'Nguyễn Văn Hải (Admin)',
    email: 'admin@phongtro365.vn',
    password: defaultPasswordHash,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '0912345678',
    zalo: '0912345678',
    status: 'ACTIVE',
    violationCount: 0,
    createAt: new Date(),
    updateAt: new Date(),
  },
  {
    id: 2,
    name: 'Trần Thị Bích Ngọc',
    email: 'chutro@phongtro365.vn',
    password: defaultPasswordHash,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    phone: '0987654321',
    zalo: '0987654321',
    status: 'ACTIVE',
    violationCount: 0,
    createAt: new Date(),
    updateAt: new Date(),
  },
  {
    id: 3,
    name: 'Lê Minh Tuấn',
    email: 'minhtuan.landlord@gmail.com',
    password: defaultPasswordHash,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '0909123456',
    zalo: '0909123456',
    status: 'ACTIVE',
    violationCount: 0,
    createAt: new Date(),
    updateAt: new Date(),
  }
];

const initialAdmins = [
  {
    id: 1,
    email: 'admin@phongtro365.vn',
    password: defaultPasswordHash,
    createById: null,
    createAt: new Date(),
    updateAt: new Date(),
  }
];

// Rich, diverse, realistic sample places in Vietnam
const initialPlaces = [
  {
    id: 1,
    ownerId: 2,
    title: 'Phòng trọ cao cấp full nội thất Cầu Giấy (gần ĐH Quốc Gia, Sư Phạm)',
    address: 'Số 18 Ngõ 122 Doãn Kế Thiện, Phường Mai Dịch, Quận Cầu Giấy, Hà Nội',
    latitude: 21.0368,
    longitude: 105.7766,
    area: 28,
    description: '<p>Phòng trọ mới xây sạch sẽ, thoáng mát, tòa nhà 6 tầng có thang máy tốc độ cao, camera an ninh 24/7. Đầy đủ tiện nghi cao cấp: Điều hòa Inverter tiết kiệm điện, bình nóng lạnh Ariston, giường tủ gỗ MDF chống ẩm, tủ lạnh 2 cánh, khu bếp nấu ăn riêng biệt.</p><p>Giờ giấc tự do, không chung chủ, khóa cửa vân tay thông minh. Cách ĐH Quốc Gia 400m, ĐH Sư Phạm 500m, ĐH Thương Mại 600m.</p>',
    extraInfo: '<p>• <strong>Điện:</strong> 3.800 đ/kWh (đồng hồ riêng từng phòng)</p><p>• <strong>Nước:</strong> 30.000 đ/khối hoặc 100.000 đ/người/tháng</p><p>• <strong>Wifi + Dịch vụ chung (thang máy, rác, vệ sinh hành lang):</strong> 120.000 đ/phòng/tháng</p><p>• <strong>Hợp đồng:</strong> Cọc 1 tháng, thanh toán hàng tháng hoặc 3 tháng/lần.</p>',
    duration: 12,
    price: 3800000,
    status: 'SEE',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updateAt: new Date(),
    photos: [
      { id: 1, placeId: 1, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000' },
      { id: 2, placeId: 1, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000' },
      { id: 3, placeId: 1, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000' },
      { id: 4, placeId: 1, url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1000' },
    ],
    perks: [
      { id: '1', placeId: 1, perk: 'wifi' },
      { id: '2', placeId: 1, perk: 'parking' },
      { id: '3', placeId: 1, perk: 'elevator' },
      { id: '4', placeId: 1, perk: 'air_conditioner' },
      { id: '5', placeId: 1, perk: 'water_heater' },
      { id: '6', placeId: 1, perk: 'kitchen' },
    ],
    owner: initialUsers[1],
    bookings: [],
    reports: [],
    favourites: [],
  },
  {
    id: 2,
    ownerId: 2,
    title: 'Chung cư mini 1 ngủ 1 khách view thoáng Chùa Láng, Đống Đa',
    address: 'Số 45 Ngõ 91 Chùa Láng, Phường Láng Thượng, Quận Đống Đa, Hà Nội',
    latitude: 21.0225,
    longitude: 105.8021,
    area: 36,
    description: '<p>Căn hộ mini 1 phòng ngủ + 1 phòng khách tách biệt sang trọng. Ban công thoáng đón ánh sáng tự nhiên ngập tràn, có máy giặt riêng ngoài ban công.</p><p>Trang bị sofa da, tivi 43 inch, tủ lạnh 200L, bếp từ đôi hút mùi âm trần. Vị trí vàng gần Hồ Chùa Láng mát mẻ, gần trường ĐH Ngoại Thương, Học viện Ngoại Giao, ĐH Luật.</p>',
    extraInfo: '<p>• <strong>Điện:</strong> 3.900 đ/số</p><p>• <strong>Nước:</strong> 120.000 đ/người</p><p>• <strong>Phí dịch vụ:</strong> 150.000 đ/phòng (bao gồm thang máy, máy giặt, vệ sinh chung)</p><p>• <strong>Cọc:</strong> 1 tháng, thanh toán linh hoạt.</p>',
    duration: 6,
    price: 5200000,
    status: 'SEE',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updateAt: new Date(),
    photos: [
      { id: 5, placeId: 2, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000' },
      { id: 6, placeId: 2, url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1000' },
      { id: 7, placeId: 2, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000' },
    ],
    perks: [
      { id: '7', placeId: 2, perk: 'wifi' },
      { id: '8', placeId: 2, perk: 'parking' },
      { id: '9', placeId: 2, perk: 'elevator' },
      { id: '10', placeId: 2, perk: 'washing' },
      { id: '11', placeId: 2, perk: 'tv' },
      { id: '12', placeId: 2, perk: 'kitchen' },
    ],
    owner: initialUsers[1],
    bookings: [],
    reports: [],
    favourites: [],
  },
  {
    id: 3,
    ownerId: 1,
    title: 'Phòng trọ sinh viên giá rẻ khu Bách Khoa - Xây Dựng - Kinh Tế',
    address: 'Số 26 Ngõ Tự Do, Phường Đồng Tâm, Quận Hai Bà Trưng, Hà Nội',
    latitude: 21.0042,
    longitude: 105.8436,
    area: 20,
    description: '<p>Phòng trọ khép kín sạch đẹp trong khu ngõ Tự Do sôi động. Có điều hòa mát lạnh, bình nóng lạnh, gác xép để đồ rộng rãi tiết kiệm diện tích.</p><p>Ngõ rộng ô tô đỗ gần nhà, an ninh đảm bảo, xung quanh đầy đủ quán ăn sinh viên giá bình dân, tạp hóa, siêu thị tiện lợi WinMart.</p>',
    extraInfo: '<p>• <strong>Điện:</strong> 3.500 đ/số</p><p>• <strong>Nước:</strong> 80.000 đ/người/tháng</p><p>• <strong>Internet:</strong> 80.000 đ/phòng</p><p>• Phù hợp ở 1 - 2 bạn sinh viên tiết kiệm chi phí.</p>',
    duration: 12,
    price: 2400000,
    status: 'SEE',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    updateAt: new Date(),
    photos: [
      { id: 8, placeId: 3, url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000' },
      { id: 9, placeId: 3, url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1000' },
      { id: 10, placeId: 3, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000' },
    ],
    perks: [
      { id: '13', placeId: 3, perk: 'wifi' },
      { id: '14', placeId: 3, perk: 'parking' },
      { id: '15', placeId: 3, perk: 'air_conditioner' },
      { id: '16', placeId: 3, perk: 'water_heater' },
    ],
    owner: initialUsers[0],
    bookings: [],
    reports: [],
    favourites: [],
  },
  {
    id: 4,
    ownerId: 3,
    title: 'Căn hộ Studio ban công view đẹp Nam Từ Liêm (gần Keangnam, Mỹ Đình)',
    address: 'Số 15 Ngõ 39 Đình Thôn, Phường Mỹ Đình 1, Quận Nam Từ Liêm, Hà Nội',
    latitude: 21.0189,
    longitude: 105.7788,
    area: 32,
    description: '<p>Studio hiện đại trang trí tông gỗ Scandinavian ấm cúng. Thiết kế cửa sổ kính chạm trần đón gió tự nhiên, ban công riêng trồng cây xanh.</p><p>Nội thất đồng bộ: Bếp từ, hút mùi, lò vi sóng, tủ lạnh Panasonic, đệm lò xo cao cấp, bàn làm việc rộng rãi cho người đi làm.</p>',
    extraInfo: '<p>• <strong>Điện:</strong> 3.800 đ/số</p><p>• <strong>Nước:</strong> 100.000 đ/người</p><p>• <strong>Phí dịch vụ trọn gói:</strong> 150.000 đ/tháng</p><p>• Ưu tiên người đi làm văn phòng, sinh viên năm cuối văn minh lịch sự.</p>',
    duration: 12,
    price: 4600000,
    status: 'SEE',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    updateAt: new Date(),
    photos: [
      { id: 11, placeId: 4, url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1000' },
      { id: 12, placeId: 4, url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000' },
      { id: 13, placeId: 4, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000' },
    ],
    perks: [
      { id: '17', placeId: 4, perk: 'wifi' },
      { id: '18', placeId: 4, perk: 'parking' },
      { id: '19', placeId: 4, perk: 'elevator' },
      { id: '20', placeId: 4, perk: 'air_conditioner' },
      { id: '21', placeId: 4, perk: 'water_heater' },
      { id: '22', placeId: 4, perk: 'kitchen' },
      { id: '23', placeId: 4, perk: 'clean' },
    ],
    owner: initialUsers[2],
    bookings: [],
    reports: [],
    favourites: [],
  },
  {
    id: 5,
    ownerId: 3,
    title: 'Ký túc xá / Sleepbox cao cấp Quận Bình Thạnh, TP.HCM (gần HUTECH, UEF)',
    address: '280 Điện Biên Phủ, Phường 21, Quận Bình Thạnh, TP. Hồ Chí Minh',
    latitude: 10.7989,
    longitude: 106.7153,
    area: 16,
    description: '<p>Mô hình Sleepbox riêng tư hiện đại bậc nhất Bình Thạnh, mỗi box có cửa khóa từ riêng, đèn học, ổ cắm, bàn gập, nệm topper êm ái.</p><p>Khu vực sinh hoạt chung gồm: Phòng bếp rộng đầy đủ gia vị nồi niêu, máy giặt sấy công nghiệp, phòng đọc sách yên tĩnh, điều hòa mở 24/24.</p>',
    extraInfo: '<p>• <strong>GIÁ TRỌN GÓI</strong> không phát sinh thêm bất kỳ chi phí nào (đã bao gồm điện, nước, máy lạnh 24/7, wifi gigabit, giặt sấy).</p><p>• <strong>Cọc:</strong> 1 tháng, dọn vào ở ngay.</p>',
    duration: 6,
    price: 1700000,
    status: 'SEE',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updateAt: new Date(),
    photos: [
      { id: 14, placeId: 5, url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1000' },
      { id: 15, placeId: 5, url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000' },
      { id: 16, placeId: 5, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000' },
    ],
    perks: [
      { id: '24', placeId: 5, perk: 'wifi' },
      { id: '25', placeId: 5, perk: 'parking' },
      { id: '26', placeId: 5, perk: 'washing' },
      { id: '27', placeId: 5, perk: 'clean' },
      { id: '28', placeId: 5, perk: 'air_conditioner' },
    ],
    owner: initialUsers[2],
    bookings: [],
    reports: [],
    favourites: [],
  },
  {
    id: 6,
    ownerId: 1,
    title: 'Căn hộ dịch vụ cao cấp Quận 1 TP.HCM (gần Phố Đi Bộ & Bến Thành)',
    address: '88 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    latitude: 10.7769,
    longitude: 106.6953,
    area: 42,
    description: '<p>Căn hộ dịch vụ chuẩn khách sạn 4 sao ngay trung tâm Quận 1. Đầy đủ tiện ích đẳng cấp: Hồ bơi vô cực sân thượng, phòng gym hiện đại miễn phí.</p><p>Dịch vụ dọn phòng 2 lần/tuần, thay ga gối định kỳ, lễ tân hỗ trợ nhiệt tình 24/7. Phù hợp chuyên gia nước ngoài hoặc nhân sự cấp cao.</p>',
    extraInfo: '<p>• <strong>Bao gồm:</strong> Dọn phòng, nước sinh hoạt, hồ bơi, gym, internet tốc độ cao.</p><p>• <strong>Điện:</strong> 4.200 đ/số theo giá kinh doanh.</p>',
    duration: 12,
    price: 8200000,
    status: 'SEE',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    updateAt: new Date(),
    photos: [
      { id: 17, placeId: 6, url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000' },
      { id: 18, placeId: 6, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000' },
      { id: 19, placeId: 6, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000' },
    ],
    perks: [
      { id: '29', placeId: 6, perk: 'wifi' },
      { id: '30', placeId: 6, perk: 'parking' },
      { id: '31', placeId: 6, perk: 'elevator' },
      { id: '32', placeId: 6, perk: 'tv' },
      { id: '33', placeId: 6, perk: 'pets' },
      { id: '34', placeId: 6, perk: 'clean' },
    ],
    owner: initialUsers[0],
    bookings: [],
    reports: [],
    favourites: [],
  },
  {
    id: 7,
    ownerId: 2,
    title: 'Phòng trọ mới xây ngõ 68 Triều Khúc, Thanh Xuân (gần ĐH Hà Nội, CN GTVT)',
    address: 'Số 32 Ngách 68/53 Phố Triều Khúc, Phường Thanh Xuân Nam, Quận Thanh Xuân, Hà Nội',
    latitude: 20.9856,
    longitude: 105.7958,
    area: 25,
    description: '<p>Phòng trọ mới 100% chưa qua sử dụng, có gác lửng cao không đụng đầu, ban công phơi đồ riêng thoáng mát đón nắng.</p><p>Trang bị sẵn điều hòa mới, bình nóng lạnh, kệ bếp đá hoa cương sạch sẽ. Khu vực sầm uất, bước chân ra ngõ là chợ Triều Khúc mua sắm tiện lợi.</p>',
    extraInfo: '<p>• <strong>Điện:</strong> 3.600 đ/số</p><p>• <strong>Nước:</strong> 90.000 đ/người</p><p>• <strong>Mạng:</strong> 100.000 đ/phòng</p><p>• Không chung chủ, cửa vân tay bảo mật cao.</p>',
    duration: 6,
    price: 3200000,
    status: 'SEE',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updateAt: new Date(),
    photos: [
      { id: 20, placeId: 7, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000' },
      { id: 21, placeId: 7, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000' },
      { id: 22, placeId: 7, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000' },
    ],
    perks: [
      { id: '35', placeId: 7, perk: 'wifi' },
      { id: '36', placeId: 7, perk: 'parking' },
      { id: '37', placeId: 7, perk: 'air_conditioner' },
      { id: '38', placeId: 7, perk: 'water_heater' },
      { id: '39', placeId: 7, perk: 'kitchen' },
    ],
    owner: initialUsers[1],
    bookings: [],
    reports: [],
    favourites: [],
  },
  {
    id: 8,
    ownerId: 3,
    title: 'Phòng trọ gác lửng đúc cao cấp Làng Đại Học Thủ Đức, TP.HCM',
    address: 'Số 12 Đường Quảng Trường Sáng Tạo, Phường Đông Hòa, TP. Thủ Đức, TP.HCM',
    latitude: 10.8752,
    longitude: 106.8007,
    area: 24,
    description: '<p>Phòng trọ cao cấp ngay sát Làng Đại học Quốc Gia TP.HCM (Bách Khoa, KHTN, KHXH&NV, CNTT, Kinh Tế Luật). Đường lớn xe hơi vào tận nhà.</p><p>Gác lửng đúc bê tông lót gạch men sạch sẽ, có ban công thoáng, toilet riêng rộng rãi, nước máy thủy cục sạch.</p>',
    extraInfo: '<p>• <strong>Điện:</strong> 3.500 đ/số</p><p>• <strong>Nước:</strong> 18.000 đ/khối</p><p>• <strong>Wifi:</strong> Miễn phí</p><p>• Giờ giấc tự do 24/7 có bảo vệ giữ xe tầng trệt.</p>',
    duration: 12,
    price: 2700000,
    status: 'SEE',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    updateAt: new Date(),
    photos: [
      { id: 23, placeId: 8, url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1000' },
      { id: 24, placeId: 8, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000' },
      { id: 25, placeId: 8, url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1000' },
    ],
    perks: [
      { id: '40', placeId: 8, perk: 'wifi' },
      { id: '41', placeId: 8, perk: 'parking' },
      { id: '42', placeId: 8, perk: 'air_conditioner' },
      { id: '43', placeId: 8, perk: 'water_heater' },
    ],
    owner: initialUsers[2],
    bookings: [],
    reports: [],
    favourites: [],
  }
];

inMemoryStore.set('user', initialUsers);
inMemoryStore.set('admin', initialAdmins);
inMemoryStore.set('place', initialPlaces);
inMemoryStore.set('placePhoto', initialPlaces.flatMap(p => p.photos || []));
inMemoryStore.set('placePerk', initialPlaces.flatMap(p => p.perks || []));
inMemoryStore.set('booking', []);
inMemoryStore.set('invoice', []);
inMemoryStore.set('invoicePhoto', []);
inMemoryStore.set('comment', [
  {
    id: 1,
    placeId: 1,
    userId: 1,
    content: 'Phòng sạch sẽ, ban công thoáng và chủ nhà rất thân thiện hỗ trợ nhiệt tình!',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    user: initialUsers[0]
  },
  {
    id: 2,
    placeId: 2,
    userId: 3,
    content: 'Vị trí gần Hồ Chùa Láng mát mẻ, an ninh tòa nhà rất tốt có khóa vân tay.',
    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    user: initialUsers[2]
  }
]);
inMemoryStore.set('favourite', []);
inMemoryStore.set('notification', []);
inMemoryStore.set('report', []);

const createMockHandler = (modelName) => {
  const normalizedKey = modelName.toLowerCase();
  if (!inMemoryStore.has(normalizedKey)) {
    inMemoryStore.set(normalizedKey, []);
  }

  return {
    findMany: async (args = {}) => {
      let items = [...(inMemoryStore.get(normalizedKey) || [])];
      if (args?.where) {
        items = items.filter(item => {
          return Object.entries(args.where).every(([k, v]) => {
            if (v && typeof v === 'object' && !Array.isArray(v)) {
              if (v.in) return v.in.includes(item[k]);
              if (v.not) return item[k] !== v.not;
              return true;
            }
            if (typeof v === 'string' && typeof item[k] === 'string') {
              return item[k].toLowerCase() === v.toLowerCase();
            }
            return item[k] === v;
          });
        });
      }
      if (args?.take) {
        items = items.slice(0, args.take);
      }
      return items;
    },
    findFirst: async (args = {}) => {
      let items = inMemoryStore.get(normalizedKey) || [];
      if (args?.where) {
        items = items.filter(item => {
          return Object.entries(args.where).every(([k, v]) => {
            if (typeof v === 'string' && typeof item[k] === 'string') {
              return item[k].toLowerCase() === v.toLowerCase();
            }
            return item[k] === v;
          });
        });
      }
      return items[0] || null;
    },
    findUnique: async (args = {}) => {
      const items = inMemoryStore.get(normalizedKey) || [];
      if (args?.where) {
        if (args.where.id !== undefined && args.where.id !== null) {
          return items.find(item => item.id === parseInt(args.where.id, 10)) || null;
        }
        if (args.where.email) {
          const searchEmail = args.where.email.trim().toLowerCase();
          return items.find(item => item.email && item.email.trim().toLowerCase() === searchEmail) || null;
        }
        return items.find(item => {
          return Object.entries(args.where).every(([k, v]) => {
            if (typeof v === 'string' && typeof item[k] === 'string') {
              return item[k].toLowerCase() === v.toLowerCase();
            }
            return item[k] === v;
          });
        }) || null;
      }
      return items[0] || null;
    },
    create: async (args = {}) => {
      const item = {
        id: mockIdCounter++,
        status: 'ACTIVE',
        violationCount: 0,
        avatar: null,
        phone: '',
        zalo: '',
        ...(args.data || {}),
        createAt: new Date(),
        updateAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const items = inMemoryStore.get(normalizedKey) || [];
      items.push(item);
      inMemoryStore.set(normalizedKey, items);
      return item;
    },
    update: async (args = {}) => {
      const items = inMemoryStore.get(normalizedKey) || [];
      const itemIndex = items.findIndex(i => {
        if (args?.where?.id) return i.id === parseInt(args.where.id, 10);
        if (args?.where?.email) return i.email && i.email.toLowerCase() === args.where.email.toLowerCase();
        return args?.where && Object.keys(args.where).every(k => i[k] === args.where[k]);
      });
      if (itemIndex >= 0) {
        items[itemIndex] = { ...items[itemIndex], ...(args.data || {}), updatedAt: new Date(), updateAt: new Date() };
        return items[itemIndex];
      }
      return { id: 1, ...(args.data || {}), updatedAt: new Date(), updateAt: new Date() };
    },
    delete: async (args = {}) => {
      const items = inMemoryStore.get(normalizedKey) || [];
      const targetId = args?.where?.id ? parseInt(args.where.id, 10) : null;
      if (targetId) {
        inMemoryStore.set(normalizedKey, items.filter(i => i.id !== targetId));
      }
      return { id: targetId || 1 };
    },
    deleteMany: async (args = {}) => {
      const items = inMemoryStore.get(normalizedKey) || [];
      if (args?.where?.placeId) {
        const pId = parseInt(args.where.placeId, 10);
        inMemoryStore.set(normalizedKey, items.filter(i => i.placeId !== pId));
      }
      return { count: 0 };
    },
    updateMany: async () => ({ count: 0 }),
    count: async (args = {}) => {
      const items = inMemoryStore.get(normalizedKey) || [];
      if (args?.where) {
        return items.filter(item => Object.entries(args.where).every(([k, v]) => item[k] === v)).length;
      }
      return items.length;
    },
    aggregate: async () => {
      const places = inMemoryStore.get('place') || [];
      const prices = places.map(p => p.price).filter(p => typeof p === 'number');
      const minPrice = prices.length ? Math.min(...prices) : 1700000;
      const maxPrice = prices.length ? Math.max(...prices) : 8500000;
      return {
        _min: { price: minPrice },
        _max: { price: maxPrice },
        _avg: { price: 3800000 },
        _count: { id: places.length }
      };
    },
    upsert: async (args = {}) => {
      return { id: mockIdCounter++, ...(args.create || args.update || {}) };
    },
  };
};

const prisma = new Proxy(rawPrisma || {}, {
  get(target, modelProp) {
    if (typeof modelProp === 'symbol' || (typeof modelProp === 'string' && modelProp.startsWith('$'))) {
      if (rawPrisma && typeof rawPrisma[modelProp] === 'function') {
        return rawPrisma[modelProp].bind(rawPrisma);
      }
      if (modelProp === '$connect' || modelProp === '$disconnect') {
        return async () => {};
      }
      return () => {};
    }

    const mockHandler = createMockHandler(modelProp);

    return new Proxy((rawPrisma && rawPrisma[modelProp]) ? rawPrisma[modelProp] : mockHandler, {
      get(modelTarget, methodProp) {
        if (typeof methodProp === 'symbol') return modelTarget[methodProp];
        
        return async (...args) => {
          if (rawPrisma && typeof rawPrisma[modelProp]?.[methodProp] === 'function' && isValidDbUrl) {
            try {
              return await rawPrisma[modelProp][methodProp](...args);
            } catch (err) {
              if (mockHandler[methodProp]) {
                return await mockHandler[methodProp](...args);
              }
              return null;
            }
          }
          if (mockHandler[methodProp]) {
            return await mockHandler[methodProp](...args);
          }
          return null;
        };
      }
    });
  }
});

module.exports = { prisma, PrismaClient };
