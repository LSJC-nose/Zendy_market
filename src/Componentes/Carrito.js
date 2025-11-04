import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (producto) => {
    if (!producto || !producto.id) {
      console.error('No se puede agregar un producto sin ID');
      return;
    }

    setCartItems((prevItems) => {
      // Verificar si el producto ya está en el carrito
      const existingItem = prevItems.find((item) => item.id === producto.id);
      
      if (existingItem) {
        // Si ya existe, incrementar la cantidad
        return prevItems.map((item) =>
          item.id === producto.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Si no existe, agregarlo con cantidad 1
        // Manejar diferentes estructuras de productos
        const precio = typeof producto.precio === 'number' 
          ? producto.precio 
          : parseFloat(producto.precio) || 0;
        
        const nombre = producto.descripcion || producto.nombre || 'Producto';
        const imagen = producto.image || producto.imagen || null;
        
        return [
          ...prevItems,
          {
            id: producto.id,
            name: nombre,
            price: precio,
            image: imagen,
            quantity: 1,
            tiendaId: producto.tiendaId,
          },
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
