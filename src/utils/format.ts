import { ethers } from 'ethers';

/**
 * Format wei amount to ETH with specified decimal places
 */
export function formatEther(wei: string, decimals: number = 4): string {
  try {
    const formatted = ethers.formatEther(wei);
    const parsedNumber = parseFloat(formatted);
    return parsedNumber.toFixed(decimals);
  } catch (error) {
    console.error('Error formatting ether:', error);
    return '0.0000';
  }
}

/**
 * Format token amount based on token decimals
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  try {
    const value = ethers.formatUnits(amount, decimals);
    const parsedNumber = parseFloat(value);
    return parsedNumber.toFixed(4);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0.0000';
  }
}

/**
 * Format timestamp to date string
 */
export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp * 1000);
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}