// ============================================================
// AI-GENERATED FILE
// Created: 2026-06-10
// Purpose: One helper for both addon-account security emails
//          (verification + password-reset codes), so the four call
//          sites (register, login auto-resend, forgot, future
//          resend endpoint) share identical send semantics:
//            - transactional sender (fromSystem, not marketing)
//            - skipPrefCheck: security mail must reach users who
//              unsubscribed from everything else
//            - bypassFeatureFlag: these sends are user-initiated and
//              critical-path; the EMAIL_SEND_ENABLED kill switch
//              exists to keep BULK mail dormant, and an addon
//              sign-up would be dead on arrival without its code.
// ============================================================
import * as React from "react"
import { sendEmail } from "@/utils/email/send"
import type { SendEmailResult } from "@/utils/email/send"
import { AnkiVerifyCode } from "../../emails/AnkiVerifyCode"
import { AnkiPasswordReset } from "../../emails/AnkiPasswordReset"
import type { CodePurpose } from "@/lib/anki/emailAccounts"

export interface AnkiAuthCodeMailArgs {
  userid: bigint
  email: string
  displayName: string
  code: string
  purpose: CodePurpose
}

export async function sendAnkiAuthCodeEmail(
  args: AnkiAuthCodeMailArgs
): Promise<SendEmailResult> {
  const { userid, email, displayName, code, purpose } = args
  const isVerify = purpose === "verify"
  return sendEmail({
    userid,
    template: isVerify ? "anki_verify_code" : "anki_password_reset",
    subject: isVerify
      ? `${code} is your LionGotchi verification code`
      : `${code} is your LionGotchi password reset code`,
    react: isVerify
      ? React.createElement(AnkiVerifyCode, { code, displayName })
      : React.createElement(AnkiPasswordReset, { code, displayName }),
    toOverride: email,
    skipPrefCheck: true,
    marketing: false,
    bypassFeatureFlag: true,
  })
}
