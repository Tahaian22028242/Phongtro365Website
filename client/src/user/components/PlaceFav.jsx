import { useState, useEffect } from 'react';
import axios from 'axios';

const PlaceFav = ({ place }) => {
  const [isFavourite, setIsFavourite] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!place?.id) return;
    const checkIfFavourite = async () => {
      try {
        const response = await axios.get('/post/favourites/check', {
          params: { placeId: place.id },
        });
        setIsFavourite(!!response.data?.isFavourite);
      } catch {
        // guest or network error
      }
    };
    checkIfFavourite();
  }, [place?.id]);

  const toggleFavourite = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    const prev = isFavourite;
    setIsFavourite(!prev);

    try {
      const method = prev ? 'DELETE' : 'POST';
      const response = await axios({
        method: method,
        url: '/post/favourites',
        data: { placeId: place.id },
      });
      if (response.data && typeof response.data.isFavourite === 'boolean') {
        setIsFavourite(response.data.isFavourite);
      }
    } catch {
      setIsFavourite(prev);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavourite}
      className={`p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-md shadow-sm hover:shadow transition-all duration-200 focus:outline-none cursor-pointer group ${
        animating ? 'scale-125' : 'hover:scale-110'
      }`}
      title={isFavourite ? "Bỏ lưu yêu thích" : "Lưu vào yêu thích"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`w-5 h-5 transition-colors duration-200 ${
          isFavourite
            ? 'fill-rose-500 stroke-rose-500'
            : 'fill-black/30 stroke-white stroke-2 group-hover:fill-black/40'
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
};

export default PlaceFav;
