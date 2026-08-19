const { Resend } = require("resend");
const env = require("../config/env");

const resend = new Resend(env.RESEND_API_KEY);

const FROM_ADDRESS = "Ecommerce <onboarding@resend.dev>";

const sendSafe = async (fn) => {
  try {
    await fn();
  } catch (err) {
    if (env.NODE_ENV !== "test") {
      console.error("[email] Error enviando correo:", err.message);
    }
  }
};

const buildVerificationHtml = (token) => {
  const verifyUrl = `${env.APP_URL}/verify-email?token=${token}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu correo electrónico</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Ecommerce</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">Hola, verifica tu correo</h2>
              <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Gracias por registrarte en <strong>Ecommerce</strong>. Para completar tu registro y comenzar a usar tu cuenta, necesitamos verificar tu dirección de correo electrónico.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" style="display:inline-block;background-color:#6c63ff;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 48px;border-radius:6px;">
                      Verificar correo
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px;color:#4a4a5a;font-size:13px;line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 24px;">
                <a href="${verifyUrl}" style="color:#6c63ff;font-size:13px;word-break:break-all;">${verifyUrl}</a>
              </p>

              <!-- Expiry notice -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#fff8e1;border-radius:6px;padding:16px;">
                    <p style="margin:0;color:#7a6c00;font-size:13px;line-height:1.5;">
                      <strong>IMPORTANTE:</strong> Este enlace expira en <strong>24 horas</strong>. Si no verificas tu correo antes de ese tiempo, deberás solicitar uno nuevo.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f5f7;padding:24px 32px;text-align:center;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                Si no creaste esta cuenta, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const sendVerificationEmail = async (email, token) => {
  const html = buildVerificationHtml(token);

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Verifica tu correo electrónico",
    html,
  });

  if (error) {
    if (env.NODE_ENV !== "test") {
      console.error("[email] Error enviando correo de verificación:", error.message);
    }
    throw error;
  }

  if (env.NODE_ENV === "development") {
    console.log(`[email] Correo de verificación enviado a ${email}, id: ${data?.id}`);
  }

  return data;
};

const buildPasswordResetHtml = (token) => {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablece tu contraseña</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Ecommerce</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">Restablece tu contraseña</h2>
              <p style="margin:0 0 24px;color:#4a4a5a;font-size:15px;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Ecommerce</strong>. Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display:inline-block;background-color:#6c63ff;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 48px;border-radius:6px;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px;color:#4a4a5a;font-size:13px;line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 24px;">
                <a href="${resetUrl}" style="color:#6c63ff;font-size:13px;word-break:break-all;">${resetUrl}</a>
              </p>

              <!-- Expiry notice -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#fff8e1;border-radius:6px;padding:16px;">
                    <p style="margin:0;color:#7a6c00;font-size:13px;line-height:1.5;">
                      <strong>IMPORTANTE:</strong> Este enlace expira en <strong>1 hora</strong>. Si no restableces tu contraseña antes de ese tiempo, deberás solicitar uno nuevo.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f5f7;padding:24px 32px;text-align:center;">
              <p style="margin:0;color:#9a9aaa;font-size:12px;line-height:1.5;">
                Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura. Tu contraseña no será modificada.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const sendPasswordResetEmail = async (email, token) => {
  const html = buildPasswordResetHtml(token);

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Restablece tu contraseña",
    html,
  });

  if (error) {
    if (env.NODE_ENV !== "test") {
      console.error("[email] Error enviando correo de restablecimiento:", error.message);
    }
    throw error;
  }

  if (env.NODE_ENV === "development") {
    console.log(`[email] Correo de restablecimiento enviado a ${email}, id: ${data?.id}`);
  }

  return data;
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendSafe };
