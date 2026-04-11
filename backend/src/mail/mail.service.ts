import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"منصة راصد" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      // We don't throw here to prevent the main action (like report creation) from failing
      return null;
    }
  }

  async sendNewReportToSupervisor(supervisorEmail: string, reportData: any) {
    const subject = `⚠️ بلاغ جديد لمطحة: ${reportData.stationNumber}`;
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #d32f2f; border-bottom: 2px solid #eee; padding-bottom: 10px;">بلاغ عطل جديد</h2>
        <p>عزيزي المشرف، تم تسجيل بلاغ جديد في محطتك:</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>المحطة:</strong> ${reportData.stationNumber}</p>
          <p><strong>التصنيف:</strong> ${reportData.category}</p>
          <p><strong>الخطورة:</strong> ${reportData.severity}</p>
          <p><strong>الوصف:</strong> ${reportData.description}</p>
        </div>
        <p>يرجى الدخول للوحة التحكم لاتخاذ الإجراء اللازم.</p>
        <a href="https://rased-pi.vercel.app/dashboard/${reportData.id}" style="display: inline-block; background: #1976d2; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">عرض تفاصيل البلاغ</a>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">هذا بريد تلقائي من منصة راصد - لا تقم بالرد عليه.</p>
      </div>
    `;
    return this.sendMail(supervisorEmail, subject, html);
  }

  async sendStatusUpdateToReporter(reporterEmail: string, reportData: any, newStatus: string) {
    const statusMap: any = {
      'new': 'جديد',
      'in_review': 'جاري الفحص',
      'assigned': 'تم التكليف لفني',
      'resolved': 'تم حل المشكلة ✅'
    };
    
    const subject = `🔔 تحديث في بلاغك: ${reportData.stationNumber}`;
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #1976d2; border-bottom: 2px solid #eee; padding-bottom: 10px;">تحديث حالة البلاغ</h2>
        <p>عزيزي المستخدم، نود إعلامك بأنه تم تحديث حالة بلاغك للمحطة <strong>${reportData.stationNumber}</strong>.</p>
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px;">الحالة الجديدة: <strong style="color: #1976d2;">${statusMap[newStatus] || newStatus}</strong></p>
        </div>
        <a href="https://rased-pi.vercel.app/dashboard/${reportData.id}" style="display: inline-block; background: #1976d2; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">متابعة البلاغ</a>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">منصة راصد - نسعى دوماً لتقديم الأفضل.</p>
      </div>
    `;
    return this.sendMail(reporterEmail, subject, html);
  }
}
