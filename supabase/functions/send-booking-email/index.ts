import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
    } = bookingData;

    const fullAddress = `${house_number} ${street_name}, ${city}, ${post_code}`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1E90FF;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .booking-details {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .detail-label {
              font-weight: bold;
              color: #555;
            }
            .detail-value {
              color: #333;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 14px;
            }
            .price {
              font-size: 24px;
              font-weight: bold;
              color: #1E90FF;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed!</h1>
              <p>Thank you for choosing Faithful Auto Care</p>
            </div>
            <div class="content">
              <p>Dear ${customer_name},</p>
              <p>Your car wash appointment has been successfully booked. Here are your booking details:</p>

              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">${booking_id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${service_type}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Vehicle Type:</span>
                  <span class="detail-value">${vehicle_type}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${new Date(booking_date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${booking_time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${fullAddress}</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Total Price:</span>
                  <span class="price">£${service_price}</span>
                </div>
              </div>

              <p><strong>What to expect:</strong></p>
              <ul>
                <li>Our professional team will visit you at the address above</li>
                <li>Average service duration is 30-45 minutes</li>
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
              <p>This is an automated confirmation email. Please do not reply to this email.</p>
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
        subject: `Booking Confirmation - ${service_type} - ${new Date(booking_date).toLocaleDateString()}`,
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
      const adminEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #28a745;
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: #f9f9f9;
                padding: 30px;
                border: 1px solid #ddd;
              }
              .booking-details {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
              }
              .detail-label {
                font-weight: bold;
                color: #555;
              }
              .detail-value {
                color: #333;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 14px;
              }
              .price {
                font-size: 24px;
                font-weight: bold;
                color: #28a745;
              }
              .badge {
                display: inline-block;
                padding: 5px 10px;
                background-color: #28a745;
                color: white;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 New Booking Received!</h1>
                <p>A new customer has scheduled a service</p>
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
                  <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value"><span class="badge">${service_type}</span></span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Vehicle Type:</span>
                    <span class="detail-value">${vehicle_type}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date(booking_date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value"><strong>${booking_time}</strong></span>
                  </div>
                  <div class="detail-row" style="border-bottom: none;">
                    <span class="detail-label">Service Price:</span>
                    <span class="price">£${service_price}</span>
                  </div>
                </div>

                <p><strong>Action Required:</strong></p>
                <ul>
                  <li>Review the booking in the admin dashboard</li>
                  <li>Prepare team and resources for the scheduled time</li>
                  <li>Contact customer if any clarification is needed</li>
                </ul>

                <p>This booking has been automatically confirmed and the customer has received a confirmation email.</p>
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
          subject: `New Booking: ${service_type} - ${new Date(booking_date).toLocaleDateString()} at ${booking_time}`,
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
        message: "Booking confirmation email sent successfully",
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
