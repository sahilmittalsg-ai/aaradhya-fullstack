import { Request, Response } from "express";

export function getHealth(_req: Request, res: Response) {
  return res.json({ ok: true });
}
