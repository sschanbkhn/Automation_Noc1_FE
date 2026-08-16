// Tach cac marker NAM DE LEN NHAU tren ban do preview (them 16082026).
//
// ==== VAN DE ====
// Nhieu tram/cell trong du lieu that dung CHUNG DUNG MOT toa do: cac cell cua cung 1 nha tram chi khac
// nhau HUONG ANTEN chu khong khac vi tri, va nhieu tram logic (tram_id khac nhau) cung duoc treo tren cung
// 1 cot. DA XAC NHAN qua goi that POST /cr/preview tram_id=111121 tren BE .196:8080: tram 117579 va
// 970260 co toa do TRUNG KHIT 21.26291,105.85040 (cell cua chung cung chung ma nha tram "SSN121", chi khac
// so hieu huong: M41/M42/M43 va M11/M12/M13). Ve thang ra ban do thi 2 marker de len nhau, nguoi dung chi
// thay 1 cham va tuong preview bi thieu tram.
//
// ==== TAI SAO KHONG PHAI CHI CAN TANG maxZoom ====
// Vi toa do TRUNG KHIT NHAU chu khong phai "gan nhau". Zoom la phep nhan ty le: hai diem cach nhau 0 met
// thi nhan voi bao nhieu van la 0 met - phong to den vo cuc chung van chong nhau y nguyen. Tang maxZoom
// chi doi lay them nhuoc diem (bo tile offline chi co zoom 6-13, vuot 13 la xin tile khong ton tai -> o
// trang lo cho, dung cai loi ma TILE_MAX_ZOOM trong NetworkMap.tsx dang chan). Muon tach thi PHAI tu doi
// toa do HIEN THI bang code - dung cach lam duoi day.

// So chu so thap phan dung de coi 2 toa do la "trung nhau". 5 chu so ~ 1.1 met o vi do Viet Nam: du chat
// de khong gom nham 2 tram that su cach nhau vai chuc met, du long de bo qua sai lech lam tron cua du lieu
const SO_CHU_SO_LAM_TRON = 5;

// Ban kinh vong tron rai marker (met). Quy doi ra DO va giu NGUYEN o moi muc zoom: khong dang ky lang
// nghe su kien zoom de tinh lai theo pixel. Doi lai, do lech vi tri hien thi luon bi chan o dung nguong
// nay - marker khong bao gio bi day di xa toi muc nguoi dung doc nham vi tri tram
const BAN_KINH_RAI_MET = 40;

// So met tren 1 do VI DO - hang so trac dia (chu vi kinh tuyen / 360). Kinh do thi phai chia them cho
// cos(vi do) vi cac duong kinh tuyen chum lai khi len cao, xem cong thuc ben duoi
const MET_MOI_DO_VI_DO = 111320;

// Hai marker trong cung 1 nhom phai lech nhau it nhat bay nhieu do thi moi chap nhan dung goc suy tu ten
// cell. Duoi nguong nay coi nhu "cung huong" -> bo het, quay ve chia deu 360 do cho ca nhom (xem tinhCacGoc)
const GOC_TOI_THIEU_GIUA_2_MARKER = 40;

// Moi buoc so hieu huong ung voi bao nhieu do. Ten cell dang 4G-<nha tram>M<huong><idx>-<tinh> (vd
// 4G-SSN121M43-HNI -> huong 4, idx 3). Nha tram 3 sector danh so huong 1/2/3; tram dat CHONG THEM bo thu
// hai tren cung cot thi danh tiep 4/5/6. Neu map theo kieu 3 sector (huong 1 -> 0 do, 2 -> 120, 3 -> 240)
// thi huong 4 lai tro ve 0 do TRUNG voi huong 1 - dung dung cap tram dang chong nhau ma ta can tach.
// Dung buoc 60 do: 6 huong dau ra 6 goc khac nhau, dam bao tach duoc dung truong hop that.
const DO_MOI_BUOC_HUONG = 60;

// Suy so hieu HUONG ANTEN tu ten cell. Tra ve null khi ten khong theo khuon (khong doan bua).
// Cach lam: cat ten theo dau "-" roi tim doan co dang <chu/so>M<2 chu so> o CUOI doan - vd "SSN121M43".
// KHONG dung regex chay thang tren ca chuoi vi ma nha tram cung chua chu so ("SSN121") lan chu M o nhieu
// vi tri, quet ca chuoi rat de bat nham cum khac
export const suyHuongTuTenCell = (cellName: string | null | undefined): number | null => {
  if (!cellName) {
    return null;
  }
  const cacDoan = cellName.split("-");
  for (const doan of cacDoan) {
    const khop = doan.match(/M(\d)(\d)$/); // M + so hieu huong + so thu tu cell trong huong
    if (khop) {
      return Number(khop[1]);
    }
  }
  return null;
};

// Doi so hieu huong thanh goc rai (do, 0 = huong Bac, tang theo chieu kim dong ho)
export const gocTuHuong = (huong: number): number => ((huong - 1) * DO_MOI_BUOC_HUONG) % 360;

// Khoang cach goc nho nhat giua 2 goc (do), luon nam trong [0, 180]
const khoangCachGoc = (a: number, b: number): number => {
  const lech = Math.abs(((a - b) % 360) + 360) % 360;
  return lech > 180 ? 360 - lech : lech;
};

// Quyet dinh goc rai cho ca 1 nhom marker trung toa do.
// UU TIEN goc suy tu ten cell (marker nam dung phia anten no phuc vu -> nguoi truc nhin ra ngay dau la
// tram nao), nhung CHI khi CA NHOM deu suy duoc VA cac goc du xa nhau. Chi can 1 marker khong suy duoc,
// hoac 2 marker ra cung mot huong, la bo het ca nhom ve chia deu 360 do: tron 2 kieu (vai cai theo huong,
// vai cai chia deu) se cho ra dung cai ket qua dang muon tranh - 2 marker de len nhau
export const tinhCacGoc = (gocGoiY: (number | null)[]): number[] => {
  const chiaDeu = gocGoiY.map((_, i) => (i * 360) / gocGoiY.length);

  if (gocGoiY.some((g) => g === null)) {
    return chiaDeu;
  }

  const goc = gocGoiY as number[];
  for (let i = 0; i < goc.length; i += 1) {
    for (let j = i + 1; j < goc.length; j += 1) {
      if (khoangCachGoc(goc[i], goc[j]) < GOC_TOI_THIEU_GIUA_2_MARKER) {
        return chiaDeu;
      }
    }
  }
  return goc;
};

// Ket qua tra ve cho tung phan tu dau vao (giu nguyen thu tu ban dau de goi y co the map thang sang marker)
export interface KetQuaTachMarker<T> {
  item: T; // phan tu goc, KHONG bi sua doi
  lat: number; // vi do DE HIEN THI (da rai) - dung cho <Marker position>
  lng: number; // kinh do DE HIEN THI (da rai)
  daTach: boolean; // true = vi tri nay da bi doi so voi toa do that
  soTrungToaDo: number; // tong so marker cung dung 1 toa do goc (ke ca chinh no); 1 = khong trung ai
}

// Ham chinh: nhan danh sach diem, tra ve toa do DE HIEN THI da tach cho nhung diem trung nhau.
//  - layToaDo: rut lat/lng that ra khoi phan tu
//  - layHuong: so hieu huong anten (suy tu ten cell) de chon goc rai - tra null neu khong suy duoc
export const tachMarkerChongNhau = <T,>(
  danhSach: T[],
  layToaDo: (item: T) => { lat: number; lng: number },
  layHuong: (item: T) => number | null
): KetQuaTachMarker<T>[] => {
  // gom theo toa do da lam tron - Map giu nguyen thu tu chen nen ket qua on dinh giua cac lan render
  const nhom = new Map<string, number[]>(); // khoa toa do -> danh sach VI TRI (index) trong danhSach
  danhSach.forEach((item, i) => {
    const { lat, lng } = layToaDo(item);
    const khoa = `${lat.toFixed(SO_CHU_SO_LAM_TRON)},${lng.toFixed(SO_CHU_SO_LAM_TRON)}`;
    const dsIndex = nhom.get(khoa);
    if (dsIndex) {
      dsIndex.push(i);
    } else {
      nhom.set(khoa, [i]);
    }
  });

  const ketQua: KetQuaTachMarker<T>[] = new Array(danhSach.length);

  nhom.forEach((dsIndex) => {
    // nhom chi co 1 marker -> khong chong ai, giu nguyen toa do that (khong duoc rai: se lam lech vi tri
    // cua marker von dang hien dung)
    if (dsIndex.length === 1) {
      const i = dsIndex[0];
      const { lat, lng } = layToaDo(danhSach[i]);
      ketQua[i] = { item: danhSach[i], lat, lng, daTach: false, soTrungToaDo: 1 };
      return;
    }

    // QUY DOI so hieu huong (1..6) sang GOC (do) TRUOC khi dua vao tinhCacGoc. tinhCacGoc so sanh khoang
    // cach GOC giua cac phan tu, dua thang so hieu huong vao thi moi cap deu chenh nhau 1-5 "do" -> luon
    // duoi nguong GOC_TOI_THIEU_GIUA_2_MARKER -> khong bao gio dung duoc goc theo huong anten (da bat duoc
    // loi nay bang chinh du lieu that cua cap tram 117579/970260 truoc khi len ban build)
    const cacGoc = tinhCacGoc(
      dsIndex.map((i) => {
        const huong = layHuong(danhSach[i]);
        return huong === null ? null : gocTuHuong(huong);
      })
    );

    dsIndex.forEach((i, viTriTrongNhom) => {
      const { lat, lng } = layToaDo(danhSach[i]);
      const gocRad = (cacGoc[viTriTrongNhom] * Math.PI) / 180;

      // Quy doi met -> do. Vi do: chia thang cho so met moi do. Kinh do: chia them cho cos(vi do) vi 1 do
      // kinh do ngan dan khi ra xa xich dao (o Ha Noi ~21 do Bac, 1 do kinh do chi con ~93% do dai o xich
      // dao) - bo qua buoc nay thi vong tron rai se bi bop deo thanh hinh e-lip
      const cosViDo = Math.cos((lat * Math.PI) / 180);
      const dLat = (BAN_KINH_RAI_MET * Math.cos(gocRad)) / MET_MOI_DO_VI_DO;
      // chan mau so: cos(vi do) tien ve 0 o hai cuc se lam kinh do van ra vo cuc. Khong xay ra voi du lieu
      // Viet Nam nhung 1 dong chan van re hon 1 marker bay ra khoi ban do khi gap toa do rac
      const dLng =
        (BAN_KINH_RAI_MET * Math.sin(gocRad)) / (MET_MOI_DO_VI_DO * Math.max(Math.abs(cosViDo), 1e-6));

      ketQua[i] = {
        item: danhSach[i],
        lat: lat + dLat,
        lng: lng + dLng,
        daTach: true,
        soTrungToaDo: dsIndex.length,
      };
    });
  });

  return ketQua;
};
