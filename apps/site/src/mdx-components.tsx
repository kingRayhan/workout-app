import Link from "next/link";
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link href={href}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
