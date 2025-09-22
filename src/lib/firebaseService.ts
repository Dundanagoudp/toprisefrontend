import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { mockProducts, mockCategories, mockUsers, mockOrders } from './mockData';

// Product services
export const getProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      // Return mock data if no products in Firestore
      return mockProducts;
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return mockProducts; // Fallback to mock data
  }
};

export const getProductById = async (id: string) => {
  try {
    const productRef = doc(db, 'products', id);
    const snapshot = await getDoc(productRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    
    // Fallback to mock data
    return mockProducts.find(product => product.id === id);
  } catch (error) {
    console.error('Error fetching product:', error);
    return mockProducts.find(product => product.id === id);
  }
};

export const getFeaturedProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('featured', '==', true), limit(6));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return mockProducts.filter(product => product.featured);
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return mockProducts.filter(product => product.featured);
  }
};

// Category services
export const getCategories = async () => {
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    if (snapshot.empty) {
      return mockCategories;
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return mockCategories;
  }
};

// Search products
export const searchProducts = async (searchTerm: string) => {
  try {
    // In a real implementation, you'd use Firestore's text search or Algolia
    // For now, we'll filter mock data
    const allProducts = await getProducts();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Order services
export const getUserOrders = async (userId: string) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return mockOrders.filter(order => order.userId === userId);
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return mockOrders.filter(order => order.userId === userId);
  }
};

export const createOrder = async (orderData: any) => {
  try {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};