# Embedded Popup Checkout

This feature allows you to embed a checkout experience on your WordPress membership site, enabling customers to purchase additional classes directly from your content pages.

## How It Works

1. **Popup Checkout**: When a customer clicks on a "Purchase" button on your WordPress site, a popup window opens with a streamlined checkout experience.

2. **Pre-filled Information**: Customer information (name, email) is automatically passed from your WordPress site using Memberium shortcodes.

3. **In-Popup Success Message**: After a successful purchase, the popup shows a success message with:
   - Confirmation of the purchase
   - Important instructions to log out and log back in
   - Order summary
   - Next steps

4. **Parent Window Notification**: The popup sends a message to the parent window (your WordPress site) to display a small notification about the successful purchase.

5. **Existing Integration**: Uses your existing Make.com integration to handle the webhook and update customer access in Keap/Memberium.

## Implementation Details

### 1. Embedded Checkout Page

We've created a new page at `/checkout/embed` that:
- Accepts URL parameters for class selection and customer info
- Has a streamlined UI optimized for popup windows
- Pre-fills customer information from URL parameters
- Handles successful purchases by closing the popup and redirecting the parent window

### 2. WordPress Integration

The `wordpress-popup-checkout.html` file provides example code that you can add to your WordPress site:
- HTML/CSS for the class teaser and purchase button
- JavaScript to open the popup window and pass customer information
- Memberium shortcodes to get the current user's information

## How to Use

1. **Deploy the Checkout App**: Make sure your checkout application is deployed and accessible from your WordPress site.

2. **Add the Code to WordPress**:
   - Copy the code from `wordpress-popup-checkout.html`
   - Replace `[YOUR_CHECKOUT_URL]` with the actual URL of your checkout application
   - Add the code to your WordPress site using a Custom HTML block or in your theme template

3. **Customize the Appearance**:
   - Modify the HTML/CSS to match your site's design
   - Customize the button text and styling
   - Add your own marketing copy to the teaser

4. **Test the Integration**:
   - Log in to your WordPress site as a member
   - Navigate to the page with the checkout button
   - Click the button to ensure the popup opens with pre-filled information
   - Complete a test purchase to verify the entire flow works

## Security Considerations

- The checkout page validates that the customer information is valid before processing the payment
- All communication with Stripe happens server-side for security
- The webhook integration ensures that access is only granted after successful payment

## Customization Options

You can customize various aspects of the checkout experience:
- Change the button text and styling
- Modify the teaser content and layout
- Adjust the popup window size
- Add additional parameters to the checkout URL if needed

## Troubleshooting

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Verify that the Memberium shortcodes are working correctly
3. Ensure your checkout application is accessible from your WordPress site
4. Test the webhook integration to make sure access is being granted properly
