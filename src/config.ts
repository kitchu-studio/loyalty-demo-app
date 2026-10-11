import { Platform } from 'react-native';

// 10.0.2.2 is the Android emulator's alias for the computer it runs on.
const fallback = Platform.OS === 'android' ? 'http://10.0.2.2:8081' : 'http://localhost:8081';

export const API_URL: string = (process.env.EXPO_PUBLIC_API_URL || fallback).replace(/\/+$/, '');
