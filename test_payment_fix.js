// Test script to verify payment confirmation works
const testPaymentConfirmation = async () => {
  const baseUrl = 'http://localhost:5000';
  const transactionId = `TXN${Date.now()}`;
  const amount = 500;
  const upiId = 'test@upi';

  console.log('🧪 Testing Payment Confirmation Fix...');
  console.log(`Transaction ID: ${transactionId}`);

  try {
    // Step 1: Confirm payment
    console.log('\n1️⃣ Confirming payment...');
    const confirmResponse = await fetch(`${baseUrl}/api/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        amount,
        upiId
      })
    });

    const confirmData = await confirmResponse.json();
    console.log('Confirm response:', confirmData);

    if (!confirmData.success) {
      throw new Error('Payment confirmation failed');
    }

    // Step 2: Verify payment
    console.log('\n2️⃣ Verifying payment...');
    const verifyResponse = await fetch(`${baseUrl}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        amount,
        upiId
      })
    });

    const verifyData = await verifyResponse.json();
    console.log('Verify response:', verifyData);

    if (verifyData.verified) {
      console.log('\n✅ SUCCESS: Payment verification works!');
      console.log('The fix is working correctly.');
    } else {
      console.log('\n❌ FAILED: Payment verification still returns false');
      console.log('The fix needs more work.');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('Make sure the backend server is running on port 5000');
  }
};

// Run the test
testPaymentConfirmation();
