import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email").transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstError?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  // Check for existing user
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 },
    );
  }

  // Create the user (default role = CLIENT)
  const hashed = await hashPassword(password);
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "CLIENT",
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json(
    { ok: true, user: { id: user.id, email: user.email } },
    { status: 201 },
  );
}
