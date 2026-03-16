import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CarInfo {
  serviceType: string;
  vehicleType: string;
  servicePrice: number;
}

interface DiscountInfo {
  is_first_time: boolean;
  first_time_discount: number;
  multi_car_discount: number;
  original_total: number;
  final_total: number;
}

interface BookingData {
  booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  house_number: string;
  street_name: string;
  post_code: string;
  city: string;
  booking_date: string;
  booking_time: string;
  service_type: string;
  service_price: number;
  vehicle_type: string;
  cars?: CarInfo[];
  discount_info?: DiscountInfo;
}

function buildCarRows(cars: CarInfo[], discountInfo?: DiscountInfo): string {
  const cheapest = Math.min(...cars.map(c => c.servicePrice));
  let cheapestUsed = false;

  return cars.map((car) => {
    const isFree = discountInfo && discountInfo.multi_car_discount > 0 && !cheapestUsed && car.servicePrice === cheapest;
    if (isFree) cheapestUsed = true;

    return `
      <div class="detail-row">
        <span class="detail-label">${car.serviceType} (${car.vehicleType})</span>
        <span class="detail-value">${isFree ? '<span style="color:#059669;font-weight:bold;">FREE</span> <s>&pound;' + car.servicePrice + '</s>' : '&pound;' + car.servicePrice}</span>
      </div>
    `;
  }).join('');
}

function buildDiscountRows(discountInfo: DiscountInfo): string {
  let html = '';
  if (discountInfo.multi_car_discount > 0) {
    html += `
      <div class="detail-row" style="color:#059669;">
        <span class="detail-label">Multi-car deal (1 free):</span>
        <span class="detail-value">-&pound;${discountInfo.multi_car_discount}</span>
      </div>
    `;
  }
  if (discountInfo.is_first_time && discountInfo.first_time_discount > 0) {
    html += `
      <div class="detail-row" style="color:#059669;">
        <span class="detail-label">First-time discount (15%):</span>
        <span class="detail-value">-&pound;${discountInfo.first_time_discount.toFixed(2)}</span>
      </div>
    `;
  }
  return html;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const bookingData: BookingData = await req.json();

    const {
      booking_id,
      customer_name,
      customer_email,
      customer_phone,
      house_number,
      street_name,
      post_code,
      city,
      booking_date,
      booking_time,
      service_type,
      service_price,
      vehicle_type,
      cars,
      discount_info,
    } = bookingData;

    const fullAddress = `${house_number} ${street_name}, ${city}, ${post_code}`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const formattedDate = new Date(booking_date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const isMultiCar = cars && cars.length > 1;
    const hasDiscount = discount_info && (discount_info.multi_car_discount > 0 || (discount_info.is_first_time && discount_info.first_time_discount > 0));
    const finalPrice = discount_info ? discount_info.final_total : service_price;

    const serviceSection = isMultiCar && cars
      ? `
        <div style="margin-bottom:8px;font-weight:bold;color:#555;">Vehicles (${cars.length}):</div>
        ${buildCarRows(cars, discount_info)}
        ${hasDiscount && discount_info ? `
          <div style="border-top:1px solid #eee;margin-top:8px;padding-top:8px;">
            <div class="detail-row">
              <span class="detail-label">Subtotal:</span>
              <span class="detail-value">&pound;${discount_info.original_total}</span>
            </div>
            ${buildDiscountRows(discount_info)}
          </div>
        ` : ''}
        <div class="detail-row" style="border-bottom: none; border-top:2px solid #eee; padding-top:12px;">
          <span class="detail-label">Total Price:</span>
          <span class="price">&pound;${Number(finalPrice).toFixed(2)}</span>
        </div>
      `
      : `
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${service_type}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Vehicle Type:</span>
          <span class="detail-value">${vehicle_type}</span>
        </div>
        ${hasDiscount && discount_info ? `
          <div class="detail-row" style="color:#059669;">
            <span class="detail-label">First-time discount (15%):</span>
            <span class="detail-value">-&pound;${discount_info.first_time_discount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Total Price:</span>
          <span class="price">&pound;${Number(finalPrice).toFixed(2)}</span>
        </div>
      `;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #CA8A04; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0 0 8px 0; font-size: 24px; }
            .header p { margin: 0; opacity: 0.9; }
            .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .status-badge { display: inline-block; padding: 6px 16px; background-color: #CA8A04; color: white; border-radius: 20px; font-size: 14px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background: #fafafa; }
            .price { font-size: 24px; font-weight: bold; color: #CA8A04; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>&#9200; Booking Received</h1>
              <p>Thank you for choosing Faithful Auto Care</p>
            </div>
            <div class="content">
              <p>Dear ${customer_name},</p>
              <p>Thank you for booking with Faithful Auto Care! We have received your booking and it is currently <strong>pending confirmation</strong>. Our team will review your booking and confirm it shortly.</p>

              <div style="text-align: center; margin: 20px 0;">
                <span class="status-badge">Pending Confirmation</span>
              </div>

              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">${booking_id}</span>
                </div>
                ${serviceSection}
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${booking_time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${fullAddress}</span>
                </div>
              </div>

              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our team will review and confirm your booking</li>
                <li>You will receive a confirmation email once approved</li>
                <li>Our professional team will then visit you at the address above at the scheduled time</li>
                <li>Payment can be made after the service</li>
              </ul>

              <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>

              <p><strong>Contact Information:</strong><br>
              Phone: 07473052794<br>
              Email: faithfulautocare00@gmail.com</p>

              <p>We look forward to serving you!</p>

              <p>Best regards,<br>
              <strong>Faithful Auto Care Team</strong><br>
              Professional Shine, Exceptional Care</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Faithful Auto Care <noreply@faithfulautocare.uk>",
        to: [customer_email],
        subject: `Booking Received - ${isMultiCar ? `${cars!.length} Cars` : service_type} - ${formattedDate}`,
        html: emailHtml,
      }),
    });

    if (!customerRes.ok) {
      const error = await customerRes.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send customer email: ${error}`);
    }

    const customerData = await customerRes.json();

    const { data: admins } = await supabase
      .from('admin_notifications')
      .select('email, name')
      .eq('is_active', true)
      .eq('receive_new_bookings', true);

    if (admins && admins.length > 0) {
      const adminServiceSection = isMultiCar && cars
        ? cars.map(car => `
            <div class="detail-row">
              <span class="detail-label">${car.serviceType} (${car.vehicleType}):</span>
              <span class="detail-value">&pound;${car.servicePrice}</span>
            </div>
          `).join('')
        : `
          <div class="detail-row">
            <span class="detail-label">Service:</span>
            <span class="detail-value"><span class="badge">${service_type}</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Vehicle Type:</span>
            <span class="detail-value">${vehicle_type}</span>
          </div>
        `;

      const discountSection = hasDiscount && discount_info ? `
        <div class="detail-row" style="color:#059669;">
          <span class="detail-label">Discounts Applied:</span>
          <span class="detail-value">
            ${discount_info.multi_car_discount > 0 ? `Multi-car: -&pound;${discount_info.multi_car_discount}` : ''}
            ${discount_info.is_first_time && discount_info.first_time_discount > 0 ? ` First-time: -&pound;${discount_info.first_time_discount.toFixed(2)}` : ''}
          </span>
        </div>
      ` : '';

      const adminEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #CA8A04; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
              .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: bold; color: #555; }
              .detail-value { color: #333; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              .price { font-size: 24px; font-weight: bold; color: #CA8A04; }
              .badge { display: inline-block; padding: 5px 10px; background-color: #CA8A04; color: white; border-radius: 4px; font-size: 12px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Booking - Pending Confirmation</h1>
                <p>A new customer has submitted a booking that needs your review</p>
              </div>
              <div class="content">
                <p><strong>Booking Details:</strong></p>
                <div class="booking-details">
                  <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value"><strong>${booking_id}</strong></span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Customer Name:</span>
                    <span class="detail-value">${customer_name}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Customer Email:</span>
                    <span class="detail-value">${customer_email}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Customer Phone:</span>
                    <span class="detail-value">${customer_phone}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${fullAddress}</span>
                  </div>
                  ${adminServiceSection}
                  ${discountSection}
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value"><strong>${booking_time}</strong></span>
                  </div>
                  <div class="detail-row" style="border-bottom: none;">
                    <span class="detail-label">Total Price:</span>
                    <span class="price">&pound;${Number(finalPrice).toFixed(2)}</span>
                  </div>
                </div>

                <p><strong>Action Required:</strong></p>
                <ul>
                  <li>Review the booking in the admin dashboard</li>
                  <li>Confirm or cancel the booking</li>
                  <li>The customer will be notified automatically once you update the status</li>
                </ul>

                <p>This booking is currently <strong>pending</strong> and the customer has been notified that it is awaiting confirmation.</p>
              </div>
              <div class="footer">
                <p>This is an automated notification from Faithful Auto Care booking system.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const adminEmails = admins.map(admin => admin.email);

      const adminRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Faithful Auto Care <noreply@faithfulautocare.uk>",
          to: adminEmails,
          subject: `New Booking Pending: ${isMultiCar ? `${cars!.length} Cars` : service_type} - ${formattedDate} at ${booking_time}`,
          html: adminEmailHtml,
        }),
      });

      if (!adminRes.ok) {
        console.error("Failed to send admin notification email");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking pending email sent successfully",
        emailId: customerData.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
