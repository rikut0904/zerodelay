export type Shelter = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export const shelters: Shelter[] = [
  {
    id: "shelter-1",
    name: "金沢市立中央小学校",
    address: "石川県金沢市長町1-1",
    lat: 36.5635,
    lng: 136.6517,
  },
  {
    id: "shelter-2",
    name: "金沢市文化ホール",
    address: "石川県金沢市高岡町15-1",
    lat: 36.5621,
    lng: 136.6485,
  },
  {
    id: "shelter-3",
    name: "金沢勤労者プラザ",
    address: "石川県金沢市北安江3-2-20",
    lat: 36.5746,
    lng: 136.6405,
  },
  {
    id: "shelter-4",
    name: "金沢市立味噌蔵町小学校",
    address: "石川県金沢市味噌蔵町1-20",
    lat: 36.5679,
    lng: 136.6569,
  },
  {
    id: "shelter-5",
    name: "金沢市立杜の里小学校",
    address: "石川県金沢市もりの里1-123",
    lat: 36.5423,
    lng: 136.6695,
  },
];
