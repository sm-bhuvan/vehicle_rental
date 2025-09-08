// utils/pricing.js
const calculateRentalAmount = (vehicle, startDate, endDate, additionalServices) => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    let totalAmount = days * vehicle.pricePerDay;

    if (additionalServices.insurance) totalAmount += 15 * days;
    if (additionalServices.gps) totalAmount += 5 * days;
    if (additionalServices.childSeat) totalAmount += 8 * days;

    const taxes = totalAmount * 0.1; // 10% tax
    return totalAmount + taxes;
};

// This function was originally in your quotes.js, move it here for reusability.
const calculateCustomQuotePricing = (vehicle, startDate, endDate, additionalServices = {}) => {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const baseAmount = days * vehicle.pricePerDay;
    
    let additionalServicesAmount = 0;
    
    // Additional service pricing
    if (additionalServices.insurance) additionalServicesAmount += days * 15;
    if (additionalServices.gps) additionalServicesAmount += days * 5;
    if (additionalServices.childSeat) additionalServicesAmount += days * 8;
    if (additionalServices.additionalDriver) additionalServicesAmount += days * 10;
    
    const insuranceAmount = additionalServices.insurance ? days * 15 : 0;
    const subtotal = baseAmount + additionalServicesAmount;
    const taxes = subtotal * 0.1; // 10% tax
    const securityDeposit = vehicle.type === 'car' ? 500 : 200;
    const totalAmount = subtotal + taxes;
    
    return {
        baseAmount,
        additionalServicesAmount,
        insuranceAmount,
        taxes: Math.round(taxes * 100) / 100,
        securityDeposit,
        totalAmount: Math.round(totalAmount * 100) / 100
    };
};

module.exports = { calculateRentalAmount, calculateCustomQuotePricing };