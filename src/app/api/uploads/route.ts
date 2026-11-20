import { getUser } from "@/lib/auth";
import { fail, ok, saveUpload } from "@/lib/http";

export async function POST(req: Request) {
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return fail("No file");
  try {
    const user = await getUser();
    return ok(await saveUpload(file, user?.id));
  } catch (e) {
    return fail((e as Error).message);
  }
}
