import Chromium from "@sparticuz/chromium";
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer-core";
import QRCode from "qrcode";

type Json = {
  message: string;
  data?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | Json>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const {
      contentQr,
      backgroundCard,
      avatar_uri,
      custom_user_id,
      user_full_name,
      formatted_birth_date,
      job_title,
      department,
    } = req.body;
    // if (!html) {
    //   return res.status(400).json({ message: "No HTML content provided" });
    // }
    const url = await QRCode.toDataURL(contentQr);
    const html = `<div class="hnhpa-identity-card" style="height: 379px;width: 597px;margin: 20px;font-family: Verdana, Geneva, Tahoma, sans-serif;">
                    <div class="header" style="background-color: #08315E; width: 100%; height: 90px; display: flex; align-items: center;">
                        <div class="logo" style="width: 25%;text-align: center;display: table;">
                            <div style="display:table-cell;vertical-align:middle;">
                                <img 
                                    src="https://firebasestorage.googleapis.com/v0/b/test-project-90c71.appspot.com/o/logo.png?alt=media&token=0d00004d-d472-4e65-8a54-9f3c5913583a" 
                                    height="80" width="80" 
                                    alt="logo"
                                    style ="margin: auto;vertical-align:middle;"
                                        >
                            </div>
                        </div>
                        <div class="title" style="width: 75%; text-align: center; color: whitesmoke;">
                            <p class="main" style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">HỘI DƯỢC BỆNH VIỆN HÀ NỘI</p>
                            <p class="sub" style="font-size: 16px; margin-top: 5px;">Hanoi Hospital Pharmacy Association</p>
                        </div>
                    </div>
                    <div class="content" style="height: 290px; background-color: ${backgroundCard}; display: flex;">
                       <img src=${url} height="60" width="60" style="position: absolute; right:3;top:3">

                        <div class="left" style="width: 30%; display: table;">
                            <div class="image-container" style="text-align: center; display:table-cell; vertical-align:middle;">
                                <img src=${avatar_uri} height="160" width="140" alt="avatar">
                                <p style="font-weight: 600;">${custom_user_id}</p>
                            </div>
                        </div>
                        <div class="right" style="width: 70%; display: flex; justify-content: center;">
                            <div class="member-info" style="padding-top: 20px; width: 90%;">
                                <h2 style="width: 100%; text-align: center; margin-bottom: 25px;">THẺ HỘI VIÊN</h2>
                                <table>
                                    <tbody><tr>
                                        <td style="min-width: 95px; vertical-align: text-top;">Họ Và Tên:</td>
                                        <td style="font-weight: bold; padding-left: 15px;">${user_full_name}</td>
                                    </tr>
                                    <tr>
                                        <td style="min-width: 95px; vertical-align: text-top;">Ngày Sinh:</td>
                                        <td style="font-weight: bold; padding-left: 15px;">${formatted_birth_date}</td>
                                    </tr>
                                    <tr>
                                        <td style="min-width: 95px; vertical-align: text-top;">Chức Vụ:</td>
                                        <td style="font-weight: bold; padding-left: 15px;">${job_title}</td>
                                    </tr>
                                    <tr>
                                        <td style="min-width: 95px; vertical-align: text-top;rr">Cơ Quan:</td>
                                        <td style="font-weight: bold; padding-left: 15px;">${department}</td>
                                    </tr>
                                </tbody></table>
                            </div>
                        </div>
                    </div>
                </div>`;

    const browser = await puppeteer.launch({
      args: Chromium.args,
      executablePath: await Chromium.executablePath(),
      headless: "new",
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 597,
        height: 379,
      },
    });
    const page = await browser.newPage();

    await page.setContent(html);

    const screenshotBase64 = await page.screenshot({
      type: "png",
      encoding: "base64",
    });

    await browser.close();

    res.json({
      message: "Image generated successfully",
      data: screenshotBase64 as string,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while generating the image" });
  }
}
