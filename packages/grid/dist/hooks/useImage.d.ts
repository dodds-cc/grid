export interface UseImageProps {
    url: string;
    crossOrigin?: string;
}
export interface UseImageResults {
    image?: HTMLImageElement;
    width: number;
    height: number;
    status: string;
}
declare const useImage: ({ url, crossOrigin }: UseImageProps) => UseImageResults;
export default useImage;
