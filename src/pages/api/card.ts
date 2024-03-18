import Chromium from 'chrome-aws-lambda';
import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer-core'

type Json = {
  message: string
  data?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | Json>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).json({ message: 'No HTML content provided' });
    }

    const browser = await puppeteer.launch({
      args: Chromium.args,
      executablePath: await Chromium.executablePath,
      headless: Chromium.headless,
    });
    const page = await browser.newPage();

    await page.setContent(html);

    const screenshotBase64 = await page.screenshot({type: "png", encoding: "base64"});

    await browser.close();

    res.setHeader('Content-Type', 'image/png');
    res.json({ message: 'Image generated successfully', data: screenshotBase64 as string });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while generating the image' });
  }
}
