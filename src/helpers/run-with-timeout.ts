export async function runWithTimeout<T>(
  action: Promise<any>,
  timeout = 15000,
): Promise<T> {
  return Promise.race([
    action,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout),
    ),
  ]);
}
