// Generated from Refnusa /v1/wilayah (Kemendagri 2025 region codes). Do not edit by hand.
export interface IndonesiaProvince {
  code: string;
  name: string;
}

export interface IndonesiaRegency {
  code: string;
  name: string;
  provinceCode: string;
}

export const INDONESIA_PROVINCES: readonly IndonesiaProvince[] = [
  {
    "code": "11",
    "name": "Aceh"
  },
  {
    "code": "12",
    "name": "Sumatera Utara"
  },
  {
    "code": "13",
    "name": "Sumatera Barat"
  },
  {
    "code": "14",
    "name": "Riau"
  },
  {
    "code": "15",
    "name": "Jambi"
  },
  {
    "code": "16",
    "name": "Sumatera Selatan"
  },
  {
    "code": "17",
    "name": "Bengkulu"
  },
  {
    "code": "18",
    "name": "Lampung"
  },
  {
    "code": "19",
    "name": "Kepulauan Bangka Belitung"
  },
  {
    "code": "21",
    "name": "Kepulauan Riau"
  },
  {
    "code": "31",
    "name": "Daerah Khusus Ibukota Jakarta"
  },
  {
    "code": "32",
    "name": "Jawa Barat"
  },
  {
    "code": "33",
    "name": "Jawa Tengah"
  },
  {
    "code": "34",
    "name": "Daerah Istimewa Yogyakarta"
  },
  {
    "code": "35",
    "name": "Jawa Timur"
  },
  {
    "code": "36",
    "name": "Banten"
  },
  {
    "code": "51",
    "name": "Bali"
  },
  {
    "code": "52",
    "name": "Nusa Tenggara Barat"
  },
  {
    "code": "53",
    "name": "Nusa Tenggara Timur"
  },
  {
    "code": "61",
    "name": "Kalimantan Barat"
  },
  {
    "code": "62",
    "name": "Kalimantan Tengah"
  },
  {
    "code": "63",
    "name": "Kalimantan Selatan"
  },
  {
    "code": "64",
    "name": "Kalimantan Timur"
  },
  {
    "code": "65",
    "name": "Kalimantan Utara"
  },
  {
    "code": "71",
    "name": "Sulawesi Utara"
  },
  {
    "code": "72",
    "name": "Sulawesi Tengah"
  },
  {
    "code": "73",
    "name": "Sulawesi Selatan"
  },
  {
    "code": "74",
    "name": "Sulawesi Tenggara"
  },
  {
    "code": "75",
    "name": "Gorontalo"
  },
  {
    "code": "76",
    "name": "Sulawesi Barat"
  },
  {
    "code": "81",
    "name": "Maluku"
  },
  {
    "code": "82",
    "name": "Maluku Utara"
  },
  {
    "code": "91",
    "name": "Papua"
  },
  {
    "code": "92",
    "name": "Papua Barat"
  },
  {
    "code": "93",
    "name": "Papua Selatan"
  },
  {
    "code": "94",
    "name": "Papua Tengah"
  },
  {
    "code": "95",
    "name": "Papua Pegunungan"
  },
  {
    "code": "96",
    "name": "Papua Barat Daya"
  }
] as const;

export const INDONESIA_PROVINCE_BY_CODE: Record<string, IndonesiaProvince> = Object.fromEntries(
  INDONESIA_PROVINCES.map((province) => [province.code, province])
);

export const INDONESIA_REGENCIES: readonly IndonesiaRegency[] = [
  {
    "code": "11.01",
    "name": "Kabupaten Aceh Selatan",
    "provinceCode": "11"
  },
  {
    "code": "11.02",
    "name": "Kabupaten Aceh Tenggara",
    "provinceCode": "11"
  },
  {
    "code": "11.03",
    "name": "Kabupaten Aceh Timur",
    "provinceCode": "11"
  },
  {
    "code": "11.04",
    "name": "Kabupaten Aceh Tengah",
    "provinceCode": "11"
  },
  {
    "code": "11.05",
    "name": "Kabupaten Aceh Barat",
    "provinceCode": "11"
  },
  {
    "code": "11.06",
    "name": "Kabupaten Aceh Besar",
    "provinceCode": "11"
  },
  {
    "code": "11.07",
    "name": "Kabupaten Pidie",
    "provinceCode": "11"
  },
  {
    "code": "11.08",
    "name": "Kabupaten Aceh Utara",
    "provinceCode": "11"
  },
  {
    "code": "11.09",
    "name": "Kabupaten Simeulue",
    "provinceCode": "11"
  },
  {
    "code": "11.10",
    "name": "Kabupaten Aceh Singkil",
    "provinceCode": "11"
  },
  {
    "code": "11.11",
    "name": "Kabupaten Bireuen",
    "provinceCode": "11"
  },
  {
    "code": "11.12",
    "name": "Kabupaten Aceh Barat Daya",
    "provinceCode": "11"
  },
  {
    "code": "11.13",
    "name": "Kabupaten Gayo Lues",
    "provinceCode": "11"
  },
  {
    "code": "11.14",
    "name": "Kabupaten Aceh Jaya",
    "provinceCode": "11"
  },
  {
    "code": "11.15",
    "name": "Kabupaten Nagan Raya",
    "provinceCode": "11"
  },
  {
    "code": "11.16",
    "name": "Kabupaten Aceh Tamiang",
    "provinceCode": "11"
  },
  {
    "code": "11.17",
    "name": "Kabupaten Bener Meriah",
    "provinceCode": "11"
  },
  {
    "code": "11.18",
    "name": "Kabupaten Pidie Jaya",
    "provinceCode": "11"
  },
  {
    "code": "11.71",
    "name": "Kota Banda Aceh",
    "provinceCode": "11"
  },
  {
    "code": "11.72",
    "name": "Kota Sabang",
    "provinceCode": "11"
  },
  {
    "code": "11.73",
    "name": "Kota Lhokseumawe",
    "provinceCode": "11"
  },
  {
    "code": "11.74",
    "name": "Kota Langsa",
    "provinceCode": "11"
  },
  {
    "code": "11.75",
    "name": "Kota Subulussalam",
    "provinceCode": "11"
  },
  {
    "code": "12.01",
    "name": "Kabupaten Tapanuli Tengah",
    "provinceCode": "12"
  },
  {
    "code": "12.02",
    "name": "Kabupaten Tapanuli Utara",
    "provinceCode": "12"
  },
  {
    "code": "12.03",
    "name": "Kabupaten Tapanuli Selatan",
    "provinceCode": "12"
  },
  {
    "code": "12.04",
    "name": "Kabupaten Nias",
    "provinceCode": "12"
  },
  {
    "code": "12.05",
    "name": "Kabupaten Langkat",
    "provinceCode": "12"
  },
  {
    "code": "12.06",
    "name": "Kabupaten Karo",
    "provinceCode": "12"
  },
  {
    "code": "12.07",
    "name": "Kabupaten Deli Serdang",
    "provinceCode": "12"
  },
  {
    "code": "12.08",
    "name": "Kabupaten Simalungun",
    "provinceCode": "12"
  },
  {
    "code": "12.09",
    "name": "Kabupaten Asahan",
    "provinceCode": "12"
  },
  {
    "code": "12.10",
    "name": "Kabupaten Labuhanbatu",
    "provinceCode": "12"
  },
  {
    "code": "12.11",
    "name": "Kabupaten Dairi",
    "provinceCode": "12"
  },
  {
    "code": "12.12",
    "name": "Kabupaten Toba",
    "provinceCode": "12"
  },
  {
    "code": "12.13",
    "name": "Kabupaten Mandailing Natal",
    "provinceCode": "12"
  },
  {
    "code": "12.14",
    "name": "Kabupaten Nias Selatan",
    "provinceCode": "12"
  },
  {
    "code": "12.15",
    "name": "Kabupaten Pakpak Bharat",
    "provinceCode": "12"
  },
  {
    "code": "12.16",
    "name": "Kabupaten Humbang Hasundutan",
    "provinceCode": "12"
  },
  {
    "code": "12.17",
    "name": "Kabupaten Samosir",
    "provinceCode": "12"
  },
  {
    "code": "12.18",
    "name": "Kabupaten Serdang Bedagai",
    "provinceCode": "12"
  },
  {
    "code": "12.19",
    "name": "Kabupaten Batu Bara",
    "provinceCode": "12"
  },
  {
    "code": "12.20",
    "name": "Kabupaten Padang Lawas Utara",
    "provinceCode": "12"
  },
  {
    "code": "12.21",
    "name": "Kabupaten Padang Lawas",
    "provinceCode": "12"
  },
  {
    "code": "12.22",
    "name": "Kabupaten Labuhanbatu Selatan",
    "provinceCode": "12"
  },
  {
    "code": "12.23",
    "name": "Kabupaten Labuhanbatu Utara",
    "provinceCode": "12"
  },
  {
    "code": "12.24",
    "name": "Kabupaten Nias Utara",
    "provinceCode": "12"
  },
  {
    "code": "12.25",
    "name": "Kabupaten Nias Barat",
    "provinceCode": "12"
  },
  {
    "code": "12.71",
    "name": "Kota Medan",
    "provinceCode": "12"
  },
  {
    "code": "12.72",
    "name": "Kota Pematangsiantar",
    "provinceCode": "12"
  },
  {
    "code": "12.73",
    "name": "Kota Sibolga",
    "provinceCode": "12"
  },
  {
    "code": "12.74",
    "name": "Kota Tanjungbalai",
    "provinceCode": "12"
  },
  {
    "code": "12.75",
    "name": "Kota Binjai",
    "provinceCode": "12"
  },
  {
    "code": "12.76",
    "name": "Kota Tebing Tinggi",
    "provinceCode": "12"
  },
  {
    "code": "12.77",
    "name": "Kota Padangsidimpuan",
    "provinceCode": "12"
  },
  {
    "code": "12.78",
    "name": "Kota Gunungsitoli",
    "provinceCode": "12"
  },
  {
    "code": "13.01",
    "name": "Kabupaten Pesisir Selatan",
    "provinceCode": "13"
  },
  {
    "code": "13.02",
    "name": "Kabupaten Solok",
    "provinceCode": "13"
  },
  {
    "code": "13.03",
    "name": "Kabupaten Sijunjung",
    "provinceCode": "13"
  },
  {
    "code": "13.04",
    "name": "Kabupaten Tanah Datar",
    "provinceCode": "13"
  },
  {
    "code": "13.05",
    "name": "Kabupaten Padang Pariaman",
    "provinceCode": "13"
  },
  {
    "code": "13.06",
    "name": "Kabupaten Agam",
    "provinceCode": "13"
  },
  {
    "code": "13.07",
    "name": "Kabupaten Lima Puluh Kota",
    "provinceCode": "13"
  },
  {
    "code": "13.08",
    "name": "Kabupaten Pasaman",
    "provinceCode": "13"
  },
  {
    "code": "13.09",
    "name": "Kabupaten Kepulauan Mentawai",
    "provinceCode": "13"
  },
  {
    "code": "13.10",
    "name": "Kabupaten Dharmasraya",
    "provinceCode": "13"
  },
  {
    "code": "13.11",
    "name": "Kabupaten Solok Selatan",
    "provinceCode": "13"
  },
  {
    "code": "13.12",
    "name": "Kabupaten Pasaman Barat",
    "provinceCode": "13"
  },
  {
    "code": "13.71",
    "name": "Kota Padang",
    "provinceCode": "13"
  },
  {
    "code": "13.72",
    "name": "Kota Solok",
    "provinceCode": "13"
  },
  {
    "code": "13.73",
    "name": "Kota Sawahlunto",
    "provinceCode": "13"
  },
  {
    "code": "13.74",
    "name": "Kota Padang Panjang",
    "provinceCode": "13"
  },
  {
    "code": "13.75",
    "name": "Kota Bukittinggi",
    "provinceCode": "13"
  },
  {
    "code": "13.76",
    "name": "Kota Payakumbuh",
    "provinceCode": "13"
  },
  {
    "code": "13.77",
    "name": "Kota Pariaman",
    "provinceCode": "13"
  },
  {
    "code": "14.01",
    "name": "Kabupaten Kampar",
    "provinceCode": "14"
  },
  {
    "code": "14.02",
    "name": "Kabupaten Indragiri Hulu",
    "provinceCode": "14"
  },
  {
    "code": "14.03",
    "name": "Kabupaten Bengkalis",
    "provinceCode": "14"
  },
  {
    "code": "14.04",
    "name": "Kabupaten Indragiri Hilir",
    "provinceCode": "14"
  },
  {
    "code": "14.05",
    "name": "Kabupaten Pelalawan",
    "provinceCode": "14"
  },
  {
    "code": "14.06",
    "name": "Kabupaten Rokan Hulu",
    "provinceCode": "14"
  },
  {
    "code": "14.07",
    "name": "Kabupaten Rokan Hilir",
    "provinceCode": "14"
  },
  {
    "code": "14.08",
    "name": "Kabupaten Siak",
    "provinceCode": "14"
  },
  {
    "code": "14.09",
    "name": "Kabupaten Kuantan Singingi",
    "provinceCode": "14"
  },
  {
    "code": "14.10",
    "name": "Kabupaten Kepulauan Meranti",
    "provinceCode": "14"
  },
  {
    "code": "14.71",
    "name": "Kota Pekanbaru",
    "provinceCode": "14"
  },
  {
    "code": "14.72",
    "name": "Kota Dumai",
    "provinceCode": "14"
  },
  {
    "code": "15.01",
    "name": "Kabupaten Kerinci",
    "provinceCode": "15"
  },
  {
    "code": "15.02",
    "name": "Kabupaten Merangin",
    "provinceCode": "15"
  },
  {
    "code": "15.03",
    "name": "Kabupaten Sarolangun",
    "provinceCode": "15"
  },
  {
    "code": "15.04",
    "name": "Kabupaten Batanghari",
    "provinceCode": "15"
  },
  {
    "code": "15.05",
    "name": "Kabupaten Muaro Jambi",
    "provinceCode": "15"
  },
  {
    "code": "15.06",
    "name": "Kabupaten Tanjung Jabung Barat",
    "provinceCode": "15"
  },
  {
    "code": "15.07",
    "name": "Kabupaten Tanjung Jabung Timur",
    "provinceCode": "15"
  },
  {
    "code": "15.08",
    "name": "Kabupaten Bungo",
    "provinceCode": "15"
  },
  {
    "code": "15.09",
    "name": "Kabupaten Tebo",
    "provinceCode": "15"
  },
  {
    "code": "15.71",
    "name": "Kota Jambi",
    "provinceCode": "15"
  },
  {
    "code": "15.72",
    "name": "Kota Sungai Penuh",
    "provinceCode": "15"
  },
  {
    "code": "16.01",
    "name": "Kabupaten Ogan Komering Ulu",
    "provinceCode": "16"
  },
  {
    "code": "16.02",
    "name": "Kabupaten Ogan Komering Ilir",
    "provinceCode": "16"
  },
  {
    "code": "16.03",
    "name": "Kabupaten Muara Enim",
    "provinceCode": "16"
  },
  {
    "code": "16.04",
    "name": "Kabupaten Lahat",
    "provinceCode": "16"
  },
  {
    "code": "16.05",
    "name": "Kabupaten Musi Rawas",
    "provinceCode": "16"
  },
  {
    "code": "16.06",
    "name": "Kabupaten Musi Banyuasin",
    "provinceCode": "16"
  },
  {
    "code": "16.07",
    "name": "Kabupaten Banyuasin",
    "provinceCode": "16"
  },
  {
    "code": "16.08",
    "name": "Kabupaten Ogan Komering Ulu Timur",
    "provinceCode": "16"
  },
  {
    "code": "16.09",
    "name": "Kabupaten Ogan Komering Ulu Selatan",
    "provinceCode": "16"
  },
  {
    "code": "16.10",
    "name": "Kabupaten Ogan Ilir",
    "provinceCode": "16"
  },
  {
    "code": "16.11",
    "name": "Kabupaten Empat Lawang",
    "provinceCode": "16"
  },
  {
    "code": "16.12",
    "name": "Kabupaten Penukal Abab Lematang Ilir",
    "provinceCode": "16"
  },
  {
    "code": "16.13",
    "name": "Kabupaten Musi Rawas Utara",
    "provinceCode": "16"
  },
  {
    "code": "16.71",
    "name": "Kota Palembang",
    "provinceCode": "16"
  },
  {
    "code": "16.72",
    "name": "Kota Pagar Alam",
    "provinceCode": "16"
  },
  {
    "code": "16.73",
    "name": "Kota Lubuk Linggau",
    "provinceCode": "16"
  },
  {
    "code": "16.74",
    "name": "Kota Prabumulih",
    "provinceCode": "16"
  },
  {
    "code": "17.01",
    "name": "Kabupaten Bengkulu Selatan",
    "provinceCode": "17"
  },
  {
    "code": "17.02",
    "name": "Kabupaten Rejang Lebong",
    "provinceCode": "17"
  },
  {
    "code": "17.03",
    "name": "Kabupaten Bengkulu Utara",
    "provinceCode": "17"
  },
  {
    "code": "17.04",
    "name": "Kabupaten Kaur",
    "provinceCode": "17"
  },
  {
    "code": "17.05",
    "name": "Kabupaten Seluma",
    "provinceCode": "17"
  },
  {
    "code": "17.06",
    "name": "Kabupaten Mukomuko",
    "provinceCode": "17"
  },
  {
    "code": "17.07",
    "name": "Kabupaten Lebong",
    "provinceCode": "17"
  },
  {
    "code": "17.08",
    "name": "Kabupaten Kepahiang",
    "provinceCode": "17"
  },
  {
    "code": "17.09",
    "name": "Kabupaten Bengkulu Tengah",
    "provinceCode": "17"
  },
  {
    "code": "17.71",
    "name": "Kota Bengkulu",
    "provinceCode": "17"
  },
  {
    "code": "18.01",
    "name": "Kabupaten Lampung Selatan",
    "provinceCode": "18"
  },
  {
    "code": "18.02",
    "name": "Kabupaten Lampung Tengah",
    "provinceCode": "18"
  },
  {
    "code": "18.03",
    "name": "Kabupaten Lampung Utara",
    "provinceCode": "18"
  },
  {
    "code": "18.04",
    "name": "Kabupaten Lampung Barat",
    "provinceCode": "18"
  },
  {
    "code": "18.05",
    "name": "Kabupaten Tulang Bawang",
    "provinceCode": "18"
  },
  {
    "code": "18.06",
    "name": "Kabupaten Tanggamus",
    "provinceCode": "18"
  },
  {
    "code": "18.07",
    "name": "Kabupaten Lampung Timur",
    "provinceCode": "18"
  },
  {
    "code": "18.08",
    "name": "Kabupaten Way Kanan",
    "provinceCode": "18"
  },
  {
    "code": "18.09",
    "name": "Kabupaten Pesawaran",
    "provinceCode": "18"
  },
  {
    "code": "18.10",
    "name": "Kabupaten Pringsewu",
    "provinceCode": "18"
  },
  {
    "code": "18.11",
    "name": "Kabupaten Mesuji",
    "provinceCode": "18"
  },
  {
    "code": "18.12",
    "name": "Kabupaten Tulang Bawang Barat",
    "provinceCode": "18"
  },
  {
    "code": "18.13",
    "name": "Kabupaten Pesisir Barat",
    "provinceCode": "18"
  },
  {
    "code": "18.71",
    "name": "Kota Bandar Lampung",
    "provinceCode": "18"
  },
  {
    "code": "18.72",
    "name": "Kota Metro",
    "provinceCode": "18"
  },
  {
    "code": "19.01",
    "name": "Kabupaten Bangka",
    "provinceCode": "19"
  },
  {
    "code": "19.02",
    "name": "Kabupaten Belitung",
    "provinceCode": "19"
  },
  {
    "code": "19.03",
    "name": "Kabupaten Bangka Selatan",
    "provinceCode": "19"
  },
  {
    "code": "19.04",
    "name": "Kabupaten Bangka Tengah",
    "provinceCode": "19"
  },
  {
    "code": "19.05",
    "name": "Kabupaten Bangka Barat",
    "provinceCode": "19"
  },
  {
    "code": "19.06",
    "name": "Kabupaten Belitung Timur",
    "provinceCode": "19"
  },
  {
    "code": "19.71",
    "name": "Kota Pangkal Pinang",
    "provinceCode": "19"
  },
  {
    "code": "21.01",
    "name": "Kabupaten Bintan",
    "provinceCode": "21"
  },
  {
    "code": "21.02",
    "name": "Kabupaten Karimun",
    "provinceCode": "21"
  },
  {
    "code": "21.03",
    "name": "Kabupaten Natuna",
    "provinceCode": "21"
  },
  {
    "code": "21.04",
    "name": "Kabupaten Lingga",
    "provinceCode": "21"
  },
  {
    "code": "21.05",
    "name": "Kabupaten Kepulauan Anambas",
    "provinceCode": "21"
  },
  {
    "code": "21.71",
    "name": "Kota Batam",
    "provinceCode": "21"
  },
  {
    "code": "21.72",
    "name": "Kota Tanjung Pinang",
    "provinceCode": "21"
  },
  {
    "code": "31.01",
    "name": "Kabupaten Administrasi Kepulauan Seribu",
    "provinceCode": "31"
  },
  {
    "code": "31.71",
    "name": "Kota Administrasi Jakarta Pusat",
    "provinceCode": "31"
  },
  {
    "code": "31.72",
    "name": "Kota Administrasi Jakarta Utara",
    "provinceCode": "31"
  },
  {
    "code": "31.73",
    "name": "Kota Administrasi Jakarta Barat",
    "provinceCode": "31"
  },
  {
    "code": "31.74",
    "name": "Kota Administrasi Jakarta Selatan",
    "provinceCode": "31"
  },
  {
    "code": "31.75",
    "name": "Kota Administrasi Jakarta Timur",
    "provinceCode": "31"
  },
  {
    "code": "32.01",
    "name": "Kabupaten Bogor",
    "provinceCode": "32"
  },
  {
    "code": "32.02",
    "name": "Kabupaten Sukabumi",
    "provinceCode": "32"
  },
  {
    "code": "32.03",
    "name": "Kabupaten Cianjur",
    "provinceCode": "32"
  },
  {
    "code": "32.04",
    "name": "Kabupaten Bandung",
    "provinceCode": "32"
  },
  {
    "code": "32.05",
    "name": "Kabupaten Garut",
    "provinceCode": "32"
  },
  {
    "code": "32.06",
    "name": "Kabupaten Tasikmalaya",
    "provinceCode": "32"
  },
  {
    "code": "32.07",
    "name": "Kabupaten Ciamis",
    "provinceCode": "32"
  },
  {
    "code": "32.08",
    "name": "Kabupaten Kuningan",
    "provinceCode": "32"
  },
  {
    "code": "32.09",
    "name": "Kabupaten Cirebon",
    "provinceCode": "32"
  },
  {
    "code": "32.10",
    "name": "Kabupaten Majalengka",
    "provinceCode": "32"
  },
  {
    "code": "32.11",
    "name": "Kabupaten Sumedang",
    "provinceCode": "32"
  },
  {
    "code": "32.12",
    "name": "Kabupaten Indramayu",
    "provinceCode": "32"
  },
  {
    "code": "32.13",
    "name": "Kabupaten Subang",
    "provinceCode": "32"
  },
  {
    "code": "32.14",
    "name": "Kabupaten Purwakarta",
    "provinceCode": "32"
  },
  {
    "code": "32.15",
    "name": "Kabupaten Karawang",
    "provinceCode": "32"
  },
  {
    "code": "32.16",
    "name": "Kabupaten Bekasi",
    "provinceCode": "32"
  },
  {
    "code": "32.17",
    "name": "Kabupaten Bandung Barat",
    "provinceCode": "32"
  },
  {
    "code": "32.18",
    "name": "Kabupaten Pangandaran",
    "provinceCode": "32"
  },
  {
    "code": "32.71",
    "name": "Kota Bogor",
    "provinceCode": "32"
  },
  {
    "code": "32.72",
    "name": "Kota Sukabumi",
    "provinceCode": "32"
  },
  {
    "code": "32.73",
    "name": "Kota Bandung",
    "provinceCode": "32"
  },
  {
    "code": "32.74",
    "name": "Kota Cirebon",
    "provinceCode": "32"
  },
  {
    "code": "32.75",
    "name": "Kota Bekasi",
    "provinceCode": "32"
  },
  {
    "code": "32.76",
    "name": "Kota Depok",
    "provinceCode": "32"
  },
  {
    "code": "32.77",
    "name": "Kota Cimahi",
    "provinceCode": "32"
  },
  {
    "code": "32.78",
    "name": "Kota Tasikmalaya",
    "provinceCode": "32"
  },
  {
    "code": "32.79",
    "name": "Kota Banjar",
    "provinceCode": "32"
  },
  {
    "code": "33.01",
    "name": "Kabupaten Cilacap",
    "provinceCode": "33"
  },
  {
    "code": "33.02",
    "name": "Kabupaten Banyumas",
    "provinceCode": "33"
  },
  {
    "code": "33.03",
    "name": "Kabupaten Purbalingga",
    "provinceCode": "33"
  },
  {
    "code": "33.04",
    "name": "Kabupaten Banjarnegara",
    "provinceCode": "33"
  },
  {
    "code": "33.05",
    "name": "Kabupaten Kebumen",
    "provinceCode": "33"
  },
  {
    "code": "33.06",
    "name": "Kabupaten Purworejo",
    "provinceCode": "33"
  },
  {
    "code": "33.07",
    "name": "Kabupaten Wonosobo",
    "provinceCode": "33"
  },
  {
    "code": "33.08",
    "name": "Kabupaten Magelang",
    "provinceCode": "33"
  },
  {
    "code": "33.09",
    "name": "Kabupaten Boyolali",
    "provinceCode": "33"
  },
  {
    "code": "33.10",
    "name": "Kabupaten Klaten",
    "provinceCode": "33"
  },
  {
    "code": "33.11",
    "name": "Kabupaten Sukoharjo",
    "provinceCode": "33"
  },
  {
    "code": "33.12",
    "name": "Kabupaten Wonogiri",
    "provinceCode": "33"
  },
  {
    "code": "33.13",
    "name": "Kabupaten Karanganyar",
    "provinceCode": "33"
  },
  {
    "code": "33.14",
    "name": "Kabupaten Sragen",
    "provinceCode": "33"
  },
  {
    "code": "33.15",
    "name": "Kabupaten Grobogan",
    "provinceCode": "33"
  },
  {
    "code": "33.16",
    "name": "Kabupaten Blora",
    "provinceCode": "33"
  },
  {
    "code": "33.17",
    "name": "Kabupaten Rembang",
    "provinceCode": "33"
  },
  {
    "code": "33.18",
    "name": "Kabupaten Pati",
    "provinceCode": "33"
  },
  {
    "code": "33.19",
    "name": "Kabupaten Kudus",
    "provinceCode": "33"
  },
  {
    "code": "33.20",
    "name": "Kabupaten Jepara",
    "provinceCode": "33"
  },
  {
    "code": "33.21",
    "name": "Kabupaten Demak",
    "provinceCode": "33"
  },
  {
    "code": "33.22",
    "name": "Kabupaten Semarang",
    "provinceCode": "33"
  },
  {
    "code": "33.23",
    "name": "Kabupaten Temanggung",
    "provinceCode": "33"
  },
  {
    "code": "33.24",
    "name": "Kabupaten Kendal",
    "provinceCode": "33"
  },
  {
    "code": "33.25",
    "name": "Kabupaten Batang",
    "provinceCode": "33"
  },
  {
    "code": "33.26",
    "name": "Kabupaten Pekalongan",
    "provinceCode": "33"
  },
  {
    "code": "33.27",
    "name": "Kabupaten Pemalang",
    "provinceCode": "33"
  },
  {
    "code": "33.28",
    "name": "Kabupaten Tegal",
    "provinceCode": "33"
  },
  {
    "code": "33.29",
    "name": "Kabupaten Brebes",
    "provinceCode": "33"
  },
  {
    "code": "33.71",
    "name": "Kota Magelang",
    "provinceCode": "33"
  },
  {
    "code": "33.72",
    "name": "Kota Surakarta",
    "provinceCode": "33"
  },
  {
    "code": "33.73",
    "name": "Kota Salatiga",
    "provinceCode": "33"
  },
  {
    "code": "33.74",
    "name": "Kota Semarang",
    "provinceCode": "33"
  },
  {
    "code": "33.75",
    "name": "Kota Pekalongan",
    "provinceCode": "33"
  },
  {
    "code": "33.76",
    "name": "Kota Tegal",
    "provinceCode": "33"
  },
  {
    "code": "34.01",
    "name": "Kabupaten Kulon Progo",
    "provinceCode": "34"
  },
  {
    "code": "34.02",
    "name": "Kabupaten Bantul",
    "provinceCode": "34"
  },
  {
    "code": "34.03",
    "name": "Kabupaten Gunungkidul",
    "provinceCode": "34"
  },
  {
    "code": "34.04",
    "name": "Kabupaten Sleman",
    "provinceCode": "34"
  },
  {
    "code": "34.71",
    "name": "Kota Yogyakarta",
    "provinceCode": "34"
  },
  {
    "code": "35.01",
    "name": "Kabupaten Pacitan",
    "provinceCode": "35"
  },
  {
    "code": "35.02",
    "name": "Kabupaten Ponorogo",
    "provinceCode": "35"
  },
  {
    "code": "35.03",
    "name": "Kabupaten Trenggalek",
    "provinceCode": "35"
  },
  {
    "code": "35.04",
    "name": "Kabupaten Tulungagung",
    "provinceCode": "35"
  },
  {
    "code": "35.05",
    "name": "Kabupaten Blitar",
    "provinceCode": "35"
  },
  {
    "code": "35.06",
    "name": "Kabupaten Kediri",
    "provinceCode": "35"
  },
  {
    "code": "35.07",
    "name": "Kabupaten Malang",
    "provinceCode": "35"
  },
  {
    "code": "35.08",
    "name": "Kabupaten Lumajang",
    "provinceCode": "35"
  },
  {
    "code": "35.09",
    "name": "Kabupaten Jember",
    "provinceCode": "35"
  },
  {
    "code": "35.10",
    "name": "Kabupaten Banyuwangi",
    "provinceCode": "35"
  },
  {
    "code": "35.11",
    "name": "Kabupaten Bondowoso",
    "provinceCode": "35"
  },
  {
    "code": "35.12",
    "name": "Kabupaten Situbondo",
    "provinceCode": "35"
  },
  {
    "code": "35.13",
    "name": "Kabupaten Probolinggo",
    "provinceCode": "35"
  },
  {
    "code": "35.14",
    "name": "Kabupaten Pasuruan",
    "provinceCode": "35"
  },
  {
    "code": "35.15",
    "name": "Kabupaten Sidoarjo",
    "provinceCode": "35"
  },
  {
    "code": "35.16",
    "name": "Kabupaten Mojokerto",
    "provinceCode": "35"
  },
  {
    "code": "35.17",
    "name": "Kabupaten Jombang",
    "provinceCode": "35"
  },
  {
    "code": "35.18",
    "name": "Kabupaten Nganjuk",
    "provinceCode": "35"
  },
  {
    "code": "35.19",
    "name": "Kabupaten Madiun",
    "provinceCode": "35"
  },
  {
    "code": "35.20",
    "name": "Kabupaten Magetan",
    "provinceCode": "35"
  },
  {
    "code": "35.21",
    "name": "Kabupaten Ngawi",
    "provinceCode": "35"
  },
  {
    "code": "35.22",
    "name": "Kabupaten Bojonegoro",
    "provinceCode": "35"
  },
  {
    "code": "35.23",
    "name": "Kabupaten Tuban",
    "provinceCode": "35"
  },
  {
    "code": "35.24",
    "name": "Kabupaten Lamongan",
    "provinceCode": "35"
  },
  {
    "code": "35.25",
    "name": "Kabupaten Gresik",
    "provinceCode": "35"
  },
  {
    "code": "35.26",
    "name": "Kabupaten Bangkalan",
    "provinceCode": "35"
  },
  {
    "code": "35.27",
    "name": "Kabupaten Sampang",
    "provinceCode": "35"
  },
  {
    "code": "35.28",
    "name": "Kabupaten Pamekasan",
    "provinceCode": "35"
  },
  {
    "code": "35.29",
    "name": "Kabupaten Sumenep",
    "provinceCode": "35"
  },
  {
    "code": "35.71",
    "name": "Kota Kediri",
    "provinceCode": "35"
  },
  {
    "code": "35.72",
    "name": "Kota Blitar",
    "provinceCode": "35"
  },
  {
    "code": "35.73",
    "name": "Kota Malang",
    "provinceCode": "35"
  },
  {
    "code": "35.74",
    "name": "Kota Probolinggo",
    "provinceCode": "35"
  },
  {
    "code": "35.75",
    "name": "Kota Pasuruan",
    "provinceCode": "35"
  },
  {
    "code": "35.76",
    "name": "Kota Mojokerto",
    "provinceCode": "35"
  },
  {
    "code": "35.77",
    "name": "Kota Madiun",
    "provinceCode": "35"
  },
  {
    "code": "35.78",
    "name": "Kota Surabaya",
    "provinceCode": "35"
  },
  {
    "code": "35.79",
    "name": "Kota Batu",
    "provinceCode": "35"
  },
  {
    "code": "36.01",
    "name": "Kabupaten Pandeglang",
    "provinceCode": "36"
  },
  {
    "code": "36.02",
    "name": "Kabupaten Lebak",
    "provinceCode": "36"
  },
  {
    "code": "36.03",
    "name": "Kabupaten Tangerang",
    "provinceCode": "36"
  },
  {
    "code": "36.04",
    "name": "Kabupaten Serang",
    "provinceCode": "36"
  },
  {
    "code": "36.71",
    "name": "Kota Tangerang",
    "provinceCode": "36"
  },
  {
    "code": "36.72",
    "name": "Kota Cilegon",
    "provinceCode": "36"
  },
  {
    "code": "36.73",
    "name": "Kota Serang",
    "provinceCode": "36"
  },
  {
    "code": "36.74",
    "name": "Kota Tangerang Selatan",
    "provinceCode": "36"
  },
  {
    "code": "51.01",
    "name": "Kabupaten Jembrana",
    "provinceCode": "51"
  },
  {
    "code": "51.02",
    "name": "Kabupaten Tabanan",
    "provinceCode": "51"
  },
  {
    "code": "51.03",
    "name": "Kabupaten Badung",
    "provinceCode": "51"
  },
  {
    "code": "51.04",
    "name": "Kabupaten Gianyar",
    "provinceCode": "51"
  },
  {
    "code": "51.05",
    "name": "Kabupaten Klungkung",
    "provinceCode": "51"
  },
  {
    "code": "51.06",
    "name": "Kabupaten Bangli",
    "provinceCode": "51"
  },
  {
    "code": "51.07",
    "name": "Kabupaten Karangasem",
    "provinceCode": "51"
  },
  {
    "code": "51.08",
    "name": "Kabupaten Buleleng",
    "provinceCode": "51"
  },
  {
    "code": "51.71",
    "name": "Kota Denpasar",
    "provinceCode": "51"
  },
  {
    "code": "52.01",
    "name": "Kabupaten Lombok Barat",
    "provinceCode": "52"
  },
  {
    "code": "52.02",
    "name": "Kabupaten Lombok Tengah",
    "provinceCode": "52"
  },
  {
    "code": "52.03",
    "name": "Kabupaten Lombok Timur",
    "provinceCode": "52"
  },
  {
    "code": "52.04",
    "name": "Kabupaten Sumbawa",
    "provinceCode": "52"
  },
  {
    "code": "52.05",
    "name": "Kabupaten Dompu",
    "provinceCode": "52"
  },
  {
    "code": "52.06",
    "name": "Kabupaten Bima",
    "provinceCode": "52"
  },
  {
    "code": "52.07",
    "name": "Kabupaten Sumbawa Barat",
    "provinceCode": "52"
  },
  {
    "code": "52.08",
    "name": "Kabupaten Lombok Utara",
    "provinceCode": "52"
  },
  {
    "code": "52.71",
    "name": "Kota Mataram",
    "provinceCode": "52"
  },
  {
    "code": "52.72",
    "name": "Kota Bima",
    "provinceCode": "52"
  },
  {
    "code": "53.01",
    "name": "Kabupaten Kupang",
    "provinceCode": "53"
  },
  {
    "code": "53.02",
    "name": "Kabupaten Timor Tengah Selatan",
    "provinceCode": "53"
  },
  {
    "code": "53.03",
    "name": "Kabupaten Timor Tengah Utara",
    "provinceCode": "53"
  },
  {
    "code": "53.04",
    "name": "Kabupaten Belu",
    "provinceCode": "53"
  },
  {
    "code": "53.05",
    "name": "Kabupaten Alor",
    "provinceCode": "53"
  },
  {
    "code": "53.06",
    "name": "Kabupaten Flores Timur",
    "provinceCode": "53"
  },
  {
    "code": "53.07",
    "name": "Kabupaten Sikka",
    "provinceCode": "53"
  },
  {
    "code": "53.08",
    "name": "Kabupaten Ende",
    "provinceCode": "53"
  },
  {
    "code": "53.09",
    "name": "Kabupaten Ngada",
    "provinceCode": "53"
  },
  {
    "code": "53.10",
    "name": "Kabupaten Manggarai",
    "provinceCode": "53"
  },
  {
    "code": "53.11",
    "name": "Kabupaten Sumba Timur",
    "provinceCode": "53"
  },
  {
    "code": "53.12",
    "name": "Kabupaten Sumba Barat",
    "provinceCode": "53"
  },
  {
    "code": "53.13",
    "name": "Kabupaten Lembata",
    "provinceCode": "53"
  },
  {
    "code": "53.14",
    "name": "Kabupaten Rote Ndao",
    "provinceCode": "53"
  },
  {
    "code": "53.15",
    "name": "Kabupaten Manggarai Barat",
    "provinceCode": "53"
  },
  {
    "code": "53.16",
    "name": "Kabupaten Nagekeo",
    "provinceCode": "53"
  },
  {
    "code": "53.17",
    "name": "Kabupaten Sumba Tengah",
    "provinceCode": "53"
  },
  {
    "code": "53.18",
    "name": "Kabupaten Sumba Barat Daya",
    "provinceCode": "53"
  },
  {
    "code": "53.19",
    "name": "Kabupaten Manggarai Timur",
    "provinceCode": "53"
  },
  {
    "code": "53.20",
    "name": "Kabupaten Sabu Raijua",
    "provinceCode": "53"
  },
  {
    "code": "53.21",
    "name": "Kabupaten Malaka",
    "provinceCode": "53"
  },
  {
    "code": "53.71",
    "name": "Kota Kupang",
    "provinceCode": "53"
  },
  {
    "code": "61.01",
    "name": "Kabupaten Sambas",
    "provinceCode": "61"
  },
  {
    "code": "61.02",
    "name": "Kabupaten Mempawah",
    "provinceCode": "61"
  },
  {
    "code": "61.03",
    "name": "Kabupaten Sanggau",
    "provinceCode": "61"
  },
  {
    "code": "61.04",
    "name": "Kabupaten Ketapang",
    "provinceCode": "61"
  },
  {
    "code": "61.05",
    "name": "Kabupaten Sintang",
    "provinceCode": "61"
  },
  {
    "code": "61.06",
    "name": "Kabupaten Kapuas Hulu",
    "provinceCode": "61"
  },
  {
    "code": "61.07",
    "name": "Kabupaten Bengkayang",
    "provinceCode": "61"
  },
  {
    "code": "61.08",
    "name": "Kabupaten Landak",
    "provinceCode": "61"
  },
  {
    "code": "61.09",
    "name": "Kabupaten Sekadau",
    "provinceCode": "61"
  },
  {
    "code": "61.10",
    "name": "Kabupaten Melawi",
    "provinceCode": "61"
  },
  {
    "code": "61.11",
    "name": "Kabupaten Kayong Utara",
    "provinceCode": "61"
  },
  {
    "code": "61.12",
    "name": "Kabupaten Kubu Raya",
    "provinceCode": "61"
  },
  {
    "code": "61.71",
    "name": "Kota Pontianak",
    "provinceCode": "61"
  },
  {
    "code": "61.72",
    "name": "Kota Singkawang",
    "provinceCode": "61"
  },
  {
    "code": "62.01",
    "name": "Kabupaten Kotawaringin Barat",
    "provinceCode": "62"
  },
  {
    "code": "62.02",
    "name": "Kabupaten Kotawaringin Timur",
    "provinceCode": "62"
  },
  {
    "code": "62.03",
    "name": "Kabupaten Kapuas",
    "provinceCode": "62"
  },
  {
    "code": "62.04",
    "name": "Kabupaten Barito Selatan",
    "provinceCode": "62"
  },
  {
    "code": "62.05",
    "name": "Kabupaten Barito Utara",
    "provinceCode": "62"
  },
  {
    "code": "62.06",
    "name": "Kabupaten Katingan",
    "provinceCode": "62"
  },
  {
    "code": "62.07",
    "name": "Kabupaten Seruyan",
    "provinceCode": "62"
  },
  {
    "code": "62.08",
    "name": "Kabupaten Sukamara",
    "provinceCode": "62"
  },
  {
    "code": "62.09",
    "name": "Kabupaten Lamandau",
    "provinceCode": "62"
  },
  {
    "code": "62.10",
    "name": "Kabupaten Gunung Mas",
    "provinceCode": "62"
  },
  {
    "code": "62.11",
    "name": "Kabupaten Pulang Pisau",
    "provinceCode": "62"
  },
  {
    "code": "62.12",
    "name": "Kabupaten Murung Raya",
    "provinceCode": "62"
  },
  {
    "code": "62.13",
    "name": "Kabupaten Barito Timur",
    "provinceCode": "62"
  },
  {
    "code": "62.71",
    "name": "Kota Palangkaraya",
    "provinceCode": "62"
  },
  {
    "code": "63.01",
    "name": "Kabupaten Tanah Laut",
    "provinceCode": "63"
  },
  {
    "code": "63.02",
    "name": "Kabupaten Kotabaru",
    "provinceCode": "63"
  },
  {
    "code": "63.03",
    "name": "Kabupaten Banjar",
    "provinceCode": "63"
  },
  {
    "code": "63.04",
    "name": "Kabupaten Barito Kuala",
    "provinceCode": "63"
  },
  {
    "code": "63.05",
    "name": "Kabupaten Tapin",
    "provinceCode": "63"
  },
  {
    "code": "63.06",
    "name": "Kabupaten Hulu Sungai Selatan",
    "provinceCode": "63"
  },
  {
    "code": "63.07",
    "name": "Kabupaten Hulu Sungai Tengah",
    "provinceCode": "63"
  },
  {
    "code": "63.08",
    "name": "Kabupaten Hulu Sungai Utara",
    "provinceCode": "63"
  },
  {
    "code": "63.09",
    "name": "Kabupaten Tabalong",
    "provinceCode": "63"
  },
  {
    "code": "63.10",
    "name": "Kabupaten Tanah Bumbu",
    "provinceCode": "63"
  },
  {
    "code": "63.11",
    "name": "Kabupaten Balangan",
    "provinceCode": "63"
  },
  {
    "code": "63.71",
    "name": "Kota Banjarmasin",
    "provinceCode": "63"
  },
  {
    "code": "63.72",
    "name": "Kota Banjarbaru",
    "provinceCode": "63"
  },
  {
    "code": "64.01",
    "name": "Kabupaten Paser",
    "provinceCode": "64"
  },
  {
    "code": "64.02",
    "name": "Kabupaten Kutai Kartanegara",
    "provinceCode": "64"
  },
  {
    "code": "64.03",
    "name": "Kabupaten Berau",
    "provinceCode": "64"
  },
  {
    "code": "64.07",
    "name": "Kabupaten Kutai Barat",
    "provinceCode": "64"
  },
  {
    "code": "64.08",
    "name": "Kabupaten Kutai Timur",
    "provinceCode": "64"
  },
  {
    "code": "64.09",
    "name": "Kabupaten Penajam Paser Utara",
    "provinceCode": "64"
  },
  {
    "code": "64.11",
    "name": "Kabupaten Mahakam Ulu",
    "provinceCode": "64"
  },
  {
    "code": "64.71",
    "name": "Kota Balikpapan",
    "provinceCode": "64"
  },
  {
    "code": "64.72",
    "name": "Kota Samarinda",
    "provinceCode": "64"
  },
  {
    "code": "64.74",
    "name": "Kota Bontang",
    "provinceCode": "64"
  },
  {
    "code": "65.01",
    "name": "Kabupaten Bulungan",
    "provinceCode": "65"
  },
  {
    "code": "65.02",
    "name": "Kabupaten Malinau",
    "provinceCode": "65"
  },
  {
    "code": "65.03",
    "name": "Kabupaten Nunukan",
    "provinceCode": "65"
  },
  {
    "code": "65.04",
    "name": "Kabupaten Tana Tidung",
    "provinceCode": "65"
  },
  {
    "code": "65.71",
    "name": "Kota Tarakan",
    "provinceCode": "65"
  },
  {
    "code": "71.01",
    "name": "Kabupaten Bolaang Mongondow",
    "provinceCode": "71"
  },
  {
    "code": "71.02",
    "name": "Kabupaten Minahasa",
    "provinceCode": "71"
  },
  {
    "code": "71.03",
    "name": "Kabupaten Kepulauan Sangihe",
    "provinceCode": "71"
  },
  {
    "code": "71.04",
    "name": "Kabupaten Kepulauan Talaud",
    "provinceCode": "71"
  },
  {
    "code": "71.05",
    "name": "Kabupaten Minahasa Selatan",
    "provinceCode": "71"
  },
  {
    "code": "71.06",
    "name": "Kabupaten Minahasa Utara",
    "provinceCode": "71"
  },
  {
    "code": "71.07",
    "name": "Kabupaten Minahasa Tenggara",
    "provinceCode": "71"
  },
  {
    "code": "71.08",
    "name": "Kabupaten Bolaang Mongondow Utara",
    "provinceCode": "71"
  },
  {
    "code": "71.09",
    "name": "Kabupaten Kep. Siau Tagulandang Biaro",
    "provinceCode": "71"
  },
  {
    "code": "71.10",
    "name": "Kabupaten Bolaang Mongondow Timur",
    "provinceCode": "71"
  },
  {
    "code": "71.11",
    "name": "Kabupaten Bolaang Mongondow Selatan",
    "provinceCode": "71"
  },
  {
    "code": "71.71",
    "name": "Kota Manado",
    "provinceCode": "71"
  },
  {
    "code": "71.72",
    "name": "Kota Bitung",
    "provinceCode": "71"
  },
  {
    "code": "71.73",
    "name": "Kota Tomohon",
    "provinceCode": "71"
  },
  {
    "code": "71.74",
    "name": "Kota Kotamobagu",
    "provinceCode": "71"
  },
  {
    "code": "72.01",
    "name": "Kabupaten Banggai",
    "provinceCode": "72"
  },
  {
    "code": "72.02",
    "name": "Kabupaten Poso",
    "provinceCode": "72"
  },
  {
    "code": "72.03",
    "name": "Kabupaten Donggala",
    "provinceCode": "72"
  },
  {
    "code": "72.04",
    "name": "Kabupaten Toli-Toli",
    "provinceCode": "72"
  },
  {
    "code": "72.05",
    "name": "Kabupaten Buol",
    "provinceCode": "72"
  },
  {
    "code": "72.06",
    "name": "Kabupaten Morowali",
    "provinceCode": "72"
  },
  {
    "code": "72.07",
    "name": "Kabupaten Banggai Kepulauan",
    "provinceCode": "72"
  },
  {
    "code": "72.08",
    "name": "Kabupaten Parigi Moutong",
    "provinceCode": "72"
  },
  {
    "code": "72.09",
    "name": "Kabupaten Tojo Una Una",
    "provinceCode": "72"
  },
  {
    "code": "72.10",
    "name": "Kabupaten Sigi",
    "provinceCode": "72"
  },
  {
    "code": "72.11",
    "name": "Kabupaten Banggai Laut",
    "provinceCode": "72"
  },
  {
    "code": "72.12",
    "name": "Kabupaten Morowali Utara",
    "provinceCode": "72"
  },
  {
    "code": "72.71",
    "name": "Kota Palu",
    "provinceCode": "72"
  },
  {
    "code": "73.01",
    "name": "Kabupaten Kepulauan Selayar",
    "provinceCode": "73"
  },
  {
    "code": "73.02",
    "name": "Kabupaten Bulukumba",
    "provinceCode": "73"
  },
  {
    "code": "73.03",
    "name": "Kabupaten Bantaeng",
    "provinceCode": "73"
  },
  {
    "code": "73.04",
    "name": "Kabupaten Jeneponto",
    "provinceCode": "73"
  },
  {
    "code": "73.05",
    "name": "Kabupaten Takalar",
    "provinceCode": "73"
  },
  {
    "code": "73.06",
    "name": "Kabupaten Gowa",
    "provinceCode": "73"
  },
  {
    "code": "73.07",
    "name": "Kabupaten Sinjai",
    "provinceCode": "73"
  },
  {
    "code": "73.08",
    "name": "Kabupaten Bone",
    "provinceCode": "73"
  },
  {
    "code": "73.09",
    "name": "Kabupaten Maros",
    "provinceCode": "73"
  },
  {
    "code": "73.10",
    "name": "Kabupaten Pangkajene dan Kepulauan",
    "provinceCode": "73"
  },
  {
    "code": "73.11",
    "name": "Kabupaten Barru",
    "provinceCode": "73"
  },
  {
    "code": "73.12",
    "name": "Kabupaten Soppeng",
    "provinceCode": "73"
  },
  {
    "code": "73.13",
    "name": "Kabupaten Wajo",
    "provinceCode": "73"
  },
  {
    "code": "73.14",
    "name": "Kabupaten Sidenreng Rappang",
    "provinceCode": "73"
  },
  {
    "code": "73.15",
    "name": "Kabupaten Pinrang",
    "provinceCode": "73"
  },
  {
    "code": "73.16",
    "name": "Kabupaten Enrekang",
    "provinceCode": "73"
  },
  {
    "code": "73.17",
    "name": "Kabupaten Luwu",
    "provinceCode": "73"
  },
  {
    "code": "73.18",
    "name": "Kabupaten Tana Toraja",
    "provinceCode": "73"
  },
  {
    "code": "73.22",
    "name": "Kabupaten Luwu Utara",
    "provinceCode": "73"
  },
  {
    "code": "73.24",
    "name": "Kabupaten Luwu Timur",
    "provinceCode": "73"
  },
  {
    "code": "73.26",
    "name": "Kabupaten Toraja Utara",
    "provinceCode": "73"
  },
  {
    "code": "73.71",
    "name": "Kota Makassar",
    "provinceCode": "73"
  },
  {
    "code": "73.72",
    "name": "Kota Parepare",
    "provinceCode": "73"
  },
  {
    "code": "73.73",
    "name": "Kota Palopo",
    "provinceCode": "73"
  },
  {
    "code": "74.01",
    "name": "Kabupaten Kolaka",
    "provinceCode": "74"
  },
  {
    "code": "74.02",
    "name": "Kabupaten Konawe",
    "provinceCode": "74"
  },
  {
    "code": "74.03",
    "name": "Kabupaten Muna",
    "provinceCode": "74"
  },
  {
    "code": "74.04",
    "name": "Kabupaten Buton",
    "provinceCode": "74"
  },
  {
    "code": "74.05",
    "name": "Kabupaten Konawe Selatan",
    "provinceCode": "74"
  },
  {
    "code": "74.06",
    "name": "Kabupaten Bombana",
    "provinceCode": "74"
  },
  {
    "code": "74.07",
    "name": "Kabupaten Wakatobi",
    "provinceCode": "74"
  },
  {
    "code": "74.08",
    "name": "Kabupaten Kolaka Utara",
    "provinceCode": "74"
  },
  {
    "code": "74.09",
    "name": "Kabupaten Konawe Utara",
    "provinceCode": "74"
  },
  {
    "code": "74.10",
    "name": "Kabupaten Buton Utara",
    "provinceCode": "74"
  },
  {
    "code": "74.11",
    "name": "Kabupaten Kolaka Timur",
    "provinceCode": "74"
  },
  {
    "code": "74.12",
    "name": "Kabupaten Konawe Kepulauan",
    "provinceCode": "74"
  },
  {
    "code": "74.13",
    "name": "Kabupaten Muna Barat",
    "provinceCode": "74"
  },
  {
    "code": "74.14",
    "name": "Kabupaten Buton Tengah",
    "provinceCode": "74"
  },
  {
    "code": "74.15",
    "name": "Kabupaten Buton Selatan",
    "provinceCode": "74"
  },
  {
    "code": "74.71",
    "name": "Kota Kendari",
    "provinceCode": "74"
  },
  {
    "code": "74.72",
    "name": "Kota Bau Bau",
    "provinceCode": "74"
  },
  {
    "code": "75.01",
    "name": "Kabupaten Gorontalo",
    "provinceCode": "75"
  },
  {
    "code": "75.02",
    "name": "Kabupaten Boalemo",
    "provinceCode": "75"
  },
  {
    "code": "75.03",
    "name": "Kabupaten Bone Bolango",
    "provinceCode": "75"
  },
  {
    "code": "75.04",
    "name": "Kabupaten Pohuwato",
    "provinceCode": "75"
  },
  {
    "code": "75.05",
    "name": "Kabupaten Gorontalo Utara",
    "provinceCode": "75"
  },
  {
    "code": "75.71",
    "name": "Kota Gorontalo",
    "provinceCode": "75"
  },
  {
    "code": "76.01",
    "name": "Kabupaten Pasangkayu",
    "provinceCode": "76"
  },
  {
    "code": "76.02",
    "name": "Kabupaten Mamuju",
    "provinceCode": "76"
  },
  {
    "code": "76.03",
    "name": "Kabupaten Mamasa",
    "provinceCode": "76"
  },
  {
    "code": "76.04",
    "name": "Kabupaten Polewali Mandar",
    "provinceCode": "76"
  },
  {
    "code": "76.05",
    "name": "Kabupaten Majene",
    "provinceCode": "76"
  },
  {
    "code": "76.06",
    "name": "Kabupaten Mamuju Tengah",
    "provinceCode": "76"
  },
  {
    "code": "81.01",
    "name": "Kabupaten Maluku Tengah",
    "provinceCode": "81"
  },
  {
    "code": "81.02",
    "name": "Kabupaten Maluku Tenggara",
    "provinceCode": "81"
  },
  {
    "code": "81.03",
    "name": "Kabupaten Kepulauan Tanimbar",
    "provinceCode": "81"
  },
  {
    "code": "81.04",
    "name": "Kabupaten Buru",
    "provinceCode": "81"
  },
  {
    "code": "81.05",
    "name": "Kabupaten Seram Bagian Timur",
    "provinceCode": "81"
  },
  {
    "code": "81.06",
    "name": "Kabupaten Seram Bagian Barat",
    "provinceCode": "81"
  },
  {
    "code": "81.07",
    "name": "Kabupaten Kepulauan Aru",
    "provinceCode": "81"
  },
  {
    "code": "81.08",
    "name": "Kabupaten Maluku Barat Daya",
    "provinceCode": "81"
  },
  {
    "code": "81.09",
    "name": "Kabupaten Buru Selatan",
    "provinceCode": "81"
  },
  {
    "code": "81.71",
    "name": "Kota Ambon",
    "provinceCode": "81"
  },
  {
    "code": "81.72",
    "name": "Kota Tual",
    "provinceCode": "81"
  },
  {
    "code": "82.01",
    "name": "Kabupaten Halmahera Barat",
    "provinceCode": "82"
  },
  {
    "code": "82.02",
    "name": "Kabupaten Halmahera Tengah",
    "provinceCode": "82"
  },
  {
    "code": "82.03",
    "name": "Kabupaten Halmahera Utara",
    "provinceCode": "82"
  },
  {
    "code": "82.04",
    "name": "Kabupaten Halmahera Selatan",
    "provinceCode": "82"
  },
  {
    "code": "82.05",
    "name": "Kabupaten Kepulauan Sula",
    "provinceCode": "82"
  },
  {
    "code": "82.06",
    "name": "Kabupaten Halmahera Timur",
    "provinceCode": "82"
  },
  {
    "code": "82.07",
    "name": "Kabupaten Pulau Morotai",
    "provinceCode": "82"
  },
  {
    "code": "82.08",
    "name": "Kabupaten Pulau Taliabu",
    "provinceCode": "82"
  },
  {
    "code": "82.71",
    "name": "Kota Ternate",
    "provinceCode": "82"
  },
  {
    "code": "82.72",
    "name": "Kota Tidore Kepulauan",
    "provinceCode": "82"
  },
  {
    "code": "91.03",
    "name": "Kabupaten Jayapura",
    "provinceCode": "91"
  },
  {
    "code": "91.05",
    "name": "Kabupaten Kepulauan Yapen",
    "provinceCode": "91"
  },
  {
    "code": "91.06",
    "name": "Kabupaten Biak Numfor",
    "provinceCode": "91"
  },
  {
    "code": "91.10",
    "name": "Kabupaten Sarmi",
    "provinceCode": "91"
  },
  {
    "code": "91.11",
    "name": "Kabupaten Keerom",
    "provinceCode": "91"
  },
  {
    "code": "91.15",
    "name": "Kabupaten Waropen",
    "provinceCode": "91"
  },
  {
    "code": "91.19",
    "name": "Kabupaten Supiori",
    "provinceCode": "91"
  },
  {
    "code": "91.20",
    "name": "Kabupaten Mamberamo Raya",
    "provinceCode": "91"
  },
  {
    "code": "91.71",
    "name": "Kota Jayapura",
    "provinceCode": "91"
  },
  {
    "code": "92.02",
    "name": "Kabupaten Manokwari",
    "provinceCode": "92"
  },
  {
    "code": "92.03",
    "name": "Kabupaten Fak Fak",
    "provinceCode": "92"
  },
  {
    "code": "92.06",
    "name": "Kabupaten Teluk Bintuni",
    "provinceCode": "92"
  },
  {
    "code": "92.07",
    "name": "Kabupaten Teluk Wondama",
    "provinceCode": "92"
  },
  {
    "code": "92.08",
    "name": "Kabupaten Kaimana",
    "provinceCode": "92"
  },
  {
    "code": "92.11",
    "name": "Kabupaten Manokwari Selatan",
    "provinceCode": "92"
  },
  {
    "code": "92.12",
    "name": "Kabupaten Pegunungan Arfak",
    "provinceCode": "92"
  },
  {
    "code": "93.01",
    "name": "Kabupaten Merauke",
    "provinceCode": "93"
  },
  {
    "code": "93.02",
    "name": "Kabupaten Boven Digoel",
    "provinceCode": "93"
  },
  {
    "code": "93.03",
    "name": "Kabupaten Mappi",
    "provinceCode": "93"
  },
  {
    "code": "93.04",
    "name": "Kabupaten Asmat",
    "provinceCode": "93"
  },
  {
    "code": "94.01",
    "name": "Kabupaten Nabire",
    "provinceCode": "94"
  },
  {
    "code": "94.02",
    "name": "Kabupaten Puncak Jaya",
    "provinceCode": "94"
  },
  {
    "code": "94.03",
    "name": "Kabupaten Paniai",
    "provinceCode": "94"
  },
  {
    "code": "94.04",
    "name": "Kabupaten Mimika",
    "provinceCode": "94"
  },
  {
    "code": "94.05",
    "name": "Kabupaten Puncak",
    "provinceCode": "94"
  },
  {
    "code": "94.06",
    "name": "Kabupaten Dogiyai",
    "provinceCode": "94"
  },
  {
    "code": "94.07",
    "name": "Kabupaten Intan Jaya",
    "provinceCode": "94"
  },
  {
    "code": "94.08",
    "name": "Kabupaten Deiyai",
    "provinceCode": "94"
  },
  {
    "code": "95.01",
    "name": "Kabupaten Jayawijaya",
    "provinceCode": "95"
  },
  {
    "code": "95.02",
    "name": "Kabupaten Pegunungan Bintang",
    "provinceCode": "95"
  },
  {
    "code": "95.03",
    "name": "Kabupaten Yahukimo",
    "provinceCode": "95"
  },
  {
    "code": "95.04",
    "name": "Kabupaten Tolikara",
    "provinceCode": "95"
  },
  {
    "code": "95.05",
    "name": "Kabupaten Mamberamo Tengah",
    "provinceCode": "95"
  },
  {
    "code": "95.06",
    "name": "Kabupaten Yalimo",
    "provinceCode": "95"
  },
  {
    "code": "95.07",
    "name": "Kabupaten Lanny Jaya",
    "provinceCode": "95"
  },
  {
    "code": "95.08",
    "name": "Kabupaten Nduga",
    "provinceCode": "95"
  },
  {
    "code": "96.01",
    "name": "Kabupaten Sorong",
    "provinceCode": "96"
  },
  {
    "code": "96.02",
    "name": "Kabupaten Sorong Selatan",
    "provinceCode": "96"
  },
  {
    "code": "96.03",
    "name": "Kabupaten Raja Ampat",
    "provinceCode": "96"
  },
  {
    "code": "96.04",
    "name": "Kabupaten Tambrauw",
    "provinceCode": "96"
  },
  {
    "code": "96.05",
    "name": "Kabupaten Maybrat",
    "provinceCode": "96"
  },
  {
    "code": "96.71",
    "name": "Kota Sorong",
    "provinceCode": "96"
  }
] as const;

export const INDONESIA_REGENCY_BY_CODE: Record<string, IndonesiaRegency> = Object.fromEntries(
  INDONESIA_REGENCIES.map((regency) => [regency.code, regency])
);

export const INDONESIA_REGENCY_BY_PROVINCE: Record<string, IndonesiaRegency[]> = INDONESIA_REGENCIES.reduce<
  Record<string, IndonesiaRegency[]>
>((accumulator, regency) => {
  const list = accumulator[regency.provinceCode];
  if (list) {
    list.push(regency);
  } else {
    accumulator[regency.provinceCode] = [regency];
  }
  return accumulator;
}, {});

export const getProvinceName = (code?: string | null): string =>
  (code && INDONESIA_PROVINCE_BY_CODE[code]?.name) || '';

export const getRegencyName = (code?: string | null): string =>
  (code && INDONESIA_REGENCY_BY_CODE[code]?.name) || '';
