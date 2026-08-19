import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getFavorites, addFavorite as addFavoriteRequest, removeFavorite as removeFavoriteRequest } from "../api/favorites";
import { showError } from "../utils/alerts";
import { useAuthContext } from "./AuthContext";

const FavoriteContext = createContext(null);

export function FavoriteProvider({ children }) {
  const { user } = useAuthContext();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setLoading(true);

    try {
      const response = await getFavorites({ limit: 9999 });
      const data = response.data?.data || [];
      setFavorites(data);
      setFavoriteIds(new Set(data.map((f) => f.productId)));
    } catch {
      setFavorites([]);
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        setFavorites([]);
        setFavoriteIds(new Set());
        return;
      }

      setLoading(true);

      try {
        const response = await getFavorites({ limit: 9999 });
        if (!active) return;
        const data = response.data?.data || [];
        setFavorites(data);
        setFavoriteIds(new Set(data.map((f) => f.productId)));
      } catch {
        if (!active) return;
        setFavorites([]);
        setFavoriteIds(new Set());
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const isFavorite = useCallback((productId) => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  const addFavorite = async (productId) => {
    try {
      const response = await addFavoriteRequest(productId);
      const newFavorite = response.data;
      setFavorites((prev) => [newFavorite, ...prev]);
      setFavoriteIds((prev) => new Set([...prev, productId]));

      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al agregar a favoritos";
      showError(msg);

      return false;
    }
  };

  const removeFavorite = async (productId) => {
    try {
      await removeFavoriteRequest(productId);
      setFavorites((prev) => prev.filter((f) => f.productId !== productId));
      setFavoriteIds((prev) => {
        const next = new Set(prev);

        next.delete(productId);

        return next;
      });

      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al eliminar de favoritos";
      showError(msg);

      return false;
    }
  };

  const toggleFavorite = async (productId) => {
    if (isFavorite(productId)) {
      return removeFavorite(productId);
    }

    return addFavorite(productId);
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        favoriteIds: Array.from(favoriteIds),
        loading,
        refreshFavorites,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components -- Patrón estándar de React Context: el hook del consumidor vive en el mismo archivo que el Provider (ver https://react.dev/reference/react/createContext). Separar el hook a src/hooks/ sería un refactor de otra fase. */
export function useFavoriteContext() {
  const context = useContext(FavoriteContext);

  if (!context) {
    throw new Error("useFavoriteContext must be used within a FavoriteProvider");
  }

  return context;
}
