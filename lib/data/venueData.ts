export interface Venue {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export const venues: Venue[] = [
  {
    id: 1,
    name: "Landmark Event Centre",
    address: "Victoria Island, Lagos",
    lat: 6.4238,
    lng: 3.4413,
  },
  {
    id: 2,
    name: "Eko Convention Centre",
    address: "Victoria Island, Lagos",
    lat: 6.4281,
    lng: 3.4219,
  },
  {
    id: 3,
    name: "Balmoral Convention Centre",
    address: "Federal Palace Hotel, Lagos",
    lat: 6.4288,
    lng: 3.4212,
  },
  {
    id: 4,
    name: "Oriental Hotel",
    address: "Lekki, Lagos",
    lat: 6.4362,
    lng: 3.4498,
  },
  {
    id: 5,
    name: "The Podium",
    address: "Lekki Phase 1",
    lat: 6.4476,
    lng: 3.4724,
  },
  {
    id: 6,
    name: "Muri Okunola Park",
    address: "Victoria Island",
    lat: 6.4313,
    lng: 3.4305,
  },
  {
    id: 7,
    name: "Tafawa Balewa Square",
    address: "Lagos Island",
    lat: 6.4502,
    lng: 3.3958,
  },
  {
    id: 8,
    name: "National Theatre",
    address: "Iganmu, Lagos",
    lat: 6.4818,
    lng: 3.3773,
  },
];