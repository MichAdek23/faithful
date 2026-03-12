import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const keepCodes = ["87168064", "66592214"];

    const { data: bookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .not("booking_code", "in", `(${keepCodes.join(",")})`)

    if (fetchError) {
      throw new Error(`Failed to fetch bookings: ${fetchError.message}`);
    }

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No bookings to process", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const seenEmails = new Set<string>();
    const uniqueBookings = bookings.filter((b) => {
      const email = b.customer_email.toLowerCase();
      if (seenEmails.has(email)) return false;
      seenEmails.add(email);
      return true;
    });

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const results: { email: string; name: string; success: boolean; error?: string }[] = [];

    for (const booking of uniqueBookings) {
      await delay(700);
      const formattedDate = new Date(booking.booking_date).toLocaleDateString("en-GB", {
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
              .header { background-color: #1E90FF; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0 0 8px 0; font-size: 24px; }
              .header p { margin: 0; opacity: 0.9; }
              .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
              .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { font-weight: bold; color: #555; }
              .detail-value { color: #333; }
              .cta-button { display: inline-block; padding: 14px 32px; background-color: #1E90FF; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background: #fafafa; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>System Upgrade Notice</h1>
                <p>Faithful Auto Care</p>
              </div>
              <div class="content">
                <p>Dear ${booking.customer_name},</p>
                <p>We are reaching out to let you know that we are currently overhauling and upgrading our booking system to serve you better.</p>
                <p>As part of this process, your previous booking has been cleared from our system:</p>

                <div class="booking-details">
                  <div class="detail-row">
                    <span class="detail-label">Booking Code:</span>
                    <span class="detail-value">${booking.booking_code}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">${booking.service_type}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${booking.booking_time}</span>
                  </div>
                </div>

                <p>We kindly ask you to <strong>rebook your appointment</strong> at your earliest convenience. We apologise for any inconvenience and appreciate your patience as we improve our services.</p>

                <div style="text-align: center;">
                  <a href="https://faithfulautocare.uk/book-now" class="cta-button">Rebook Now</a>
                </div>

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

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Faithful Auto Care <noreply@faithfulautocare.uk>",
            to: [booking.customer_email],
            subject: `Action Required: Please Rebook Your Appointment - ${booking.service_type}`,
            html: emailHtml,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          results.push({ email: booking.customer_email, name: booking.customer_name, success: false, error: errText });
        } else {
          results.push({ email: booking.customer_email, name: booking.customer_name, success: true });
        }
      } catch (emailErr) {
        results.push({
          email: booking.customer_email,
          name: booking.customer_name,
          success: false,
          error: emailErr instanceof Error ? emailErr.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        total: bookings.length,
        sent: successCount,
        failed: failCount,
        details: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-rebook-emails:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
