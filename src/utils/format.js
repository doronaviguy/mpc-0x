"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEther = formatEther;
exports.formatTokenAmount = formatTokenAmount;
exports.formatTimestamp = formatTimestamp;
exports.shortenAddress = shortenAddress;
const ethers_1 = require("ethers");
/**
 * Format wei amount to ETH with specified decimal places
 */
function formatEther(wei, decimals = 4) {
    try {
        const formatted = ethers_1.ethers.formatEther(wei);
        const parsedNumber = parseFloat(formatted);
        return parsedNumber.toFixed(decimals);
    }
    catch (error) {
        console.error('Error formatting ether:', error);
        return '0.0000';
    }
}
/**
 * Format token amount based on token decimals
 */
function formatTokenAmount(amount, decimals) {
    try {
        const value = ethers_1.ethers.formatUnits(amount, decimals);
        const parsedNumber = parseFloat(value);
        return parsedNumber.toFixed(4);
    }
    catch (error) {
        console.error('Error formatting token amount:', error);
        return '0.0000';
    }
}
/**
 * Format timestamp to date string
 */
function formatTimestamp(timestamp) {
    try {
        const date = new Date(timestamp * 1000);
        return date.toISOString();
    }
    catch (error) {
        console.error('Error formatting timestamp:', error);
        return '';
    }
}
/**
 * Shorten address for display
 */
function shortenAddress(address) {
    if (!address)
        return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
