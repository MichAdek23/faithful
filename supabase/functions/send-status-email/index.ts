import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StatusUpdateData {
  booking_id: string;
  booking_code: string;
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
  new_status: string;
}

const STATUS_CONFIG: Record<
  string,
  { title: string; color: string; message: string; icon: string }
> = {
  washed: {
    title: "Service Completed!",
    color: "#2563EB",
    message:
      "Great news! Your vehicle has been washed and is looking spotless. We hope you love the results!",
    icon: "&#128166;",
  },
  confirmed: {
    title: "Booking Confirmed",
    color: "#16A34A",
    message:
      "Your booking has been confirmed. Our team will arrive at the scheduled time to take care of your vehicle.",
    icon: "&#9989;",
  },
  pending: {
    title: "Booking Under Review",
    color: "#CA8A04",
    message:
      "Your booking is currently being reviewed. We will notify you once it has been confirmed.",
    icon: "&#9200;",
  },
  cancelled: {
    title: "Booking Cancelled",
    color: "#DC2626",
    message:
      "Your booking has been cancelled. If this was unexpected, please contact us and we will be happy to assist you.",
    icon: "&#10060;",
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data: StatusUpdateData = await req.json();

    const {
      booking_id,
      booking_code,
      customer_name,
      customer_email,
      house_number,
      street_name,
      post_code,
      city,
      booking_date,
      booking_time,
      service_type,
      service_price,
      vehicle_type,
      new_status,
    } = data;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const config = STATUS_CONFIG[new_status];
    if (!config) {
      throw new Error(`Unknown status: ${new_status}`);
    }

    const fullAddress = `${house_number} ${street_name}, ${city}, ${post_code}`;
    const formattedDate = new Date(booking_date).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${config.color}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0 0 8px 0; font-size: 24px; }
            .header p { margin: 0; opacity: 0.9; }
            .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .status-badge { display: inline-block; padding: 6px 16px; background-color: ${config.color}; color: white; border-radius: 20px; font-size: 14px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background: #fafafa; }
            .price { font-size: 24px; font-weight: bold; color: ${config.color}; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${config.icon} ${config.title}</h1>
              <p>Faithful Auto Care</p>
            </div>
            <div class="content">
              <p>Dear ${customer_name},</p>
              <p>${config.message}</p>

              <div style="text-align: center; margin: 20px 0;">
                <span class="status-badge">${new_status.charAt(0).toUpperCase() + new_status.slice(1)}</span>
              </div>

              <div class="booking-details">
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value">${booking_code || booking_id}</span>
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
                <div class="detail-row">
                  <span class="detail-label">Total Price:</span>
                  <span class="price">&pound;${service_price}</span>
                </div>
              </div>

              ${
                new_status === "washed"
                  ? `<p>We would love to hear about your experience! If you have a moment, please leave us a review.</p>`
                  : ""
              }

              <p><strong>Contact Information:</strong><br>
              Phone: 07473052794<br>
              Email: faithfulautocare00@gmail.com</p>

              <p>Best regards,<br>
              <strong>Faithful Auto Care Team</strong><br>
              Professional Shine, Exceptional Care</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Faithful Auto Care. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const subjectMap: Record<string, string> = {
      washed: `Service Completed - ${service_type} - ${formattedDate}`,
      confirmed: `Booking Confirmed - ${service_type} - ${formattedDate}`,
      pending: `Booking Under Review - ${service_type} - ${formattedDate}`,
      cancelled: `Booking Cancelled - ${service_type} - ${formattedDate}`,
    };

    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Faithful Auto Care <noreply@faithfulautocare.uk>",
        to: [customer_email],
        subject: subjectMap[new_status] || `Booking Update - ${service_type}`,
        html: emailHtml,
      }),
    });

    if (!customerRes.ok) {
      const error = await customerRes.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const customerData = await customerRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Status update email sent successfully",
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
    console.error("Error sending status email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
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
