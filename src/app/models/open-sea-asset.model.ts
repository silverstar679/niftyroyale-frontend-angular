export interface OpenSeaAsset {
  attributes: string[];
  description: string;
  external_url: string;
  image_url: string;
  name: string;
  owner: {
    address: string;
  };
  placement: number;
  eliminated: boolean;
}
