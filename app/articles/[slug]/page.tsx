import React from "react";
import Markdoc from "@markdoc/markdoc";
import Link from "next/link";
import Head from "next/head";
import BioBar from "@/components/BioBar/BioBar";
import { markdocComponents } from "@/markdoc/components";
import { config } from "@/markdoc/config";
import CommentsArea from "@/components/Comments/CommentsArea";
import ArticleMenu from "@/components/ArticleMenu/ArticleMenu";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/server/trpc/server";
import ArticleAdminPanel from "@/components/ArticleAdminPanel/ArticleAdminPanel";
import { type ResolvingMetadata, type Metadata } from "next";

type Props = { params: { slug: string } };

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = params.slug;

  const post = await api.post.bySlug.query({
    slug,
  });

  // Might revisit to give more defaults
  const tags = post?.tags.map((tag) => tag.tag.title);

  if (!post) return {};
  const host = headers().get("host") || "";
  return {
    title: post.title,
    authors: {
      name: post.user.name,
      url: `https://www.${host}/${post.user.username}`,
    },
    keywords: tags,
    description: post.excerpt,
    openGraph: {
      description: post.excerpt,
      type: "article",
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
      siteName: "Codú",
    },
    twitter: {
      description: post.excerpt,
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
    },
    alternates: {
      canonical: post.canonicalUrl,
    },
  };
}

const ArticlePage = async ({ params }: Props) => {
  const session = await getServerAuthSession();
  const { slug } = params;

  const host = headers().get("host") || "";

  const post = await api.post.bySlug.query({
    slug,
  });

  if (!post) {
    notFound();
  }

  const ast = Markdoc.parse(post.body);
  const content = Markdoc.transform(ast, config);

  return (
    <>
      <Head>
        {/* @TODO confirm metadata is correct and remove <Head> */}
        <title>{post.title}</title>
        {post.canonicalUrl && <link rel="canonical" href={post.canonicalUrl} />}
        <meta name="author" content={post.user.name}></meta>
        <meta key="og:title" property="og:title" content={post.title} />
        <meta
          key="og:description"
          property="og:description"
          content={post.excerpt}
        />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="browserconfig.xml" />
        <meta name="theme-color" content="#000" />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://${host}/articles/${post.slug}`}
        />
        <meta
          name="image"
          property="og:image"
          content={`https://${host}/api/og?title=${encodeURIComponent(
            post.title,
          )}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <>
        <ArticleMenu
          session={session}
          postId={post.id}
          postTitle={post.title}
          postUsername={post?.user.username || ""}
          postUrl={`https://${host}/articles/${post.slug}`}
        />
        <div className="mx-auto pb-4 md:max-w-3xl px-2 sm:px-4 break-words">
          <article className="prose dark:prose-invert lg:prose-lg mx-auto max-w-3xl">
            <h1>{post.title}</h1>
            {Markdoc.renderers.react(content, React, {
              components: markdocComponents,
            })}
          </article>
          {post.tags.length > 0 && (
            <section className="flex flex-wrap gap-3">
              {post.tags.map(({ tag }) => (
                <Link
                  href={`/articles?tag=${tag.title.toLowerCase()}`}
                  key={tag.title}
                  className="bg-gradient-to-r from-orange-400 to-pink-600 hover:bg-pink-700 text-white py-1 px-3 rounded-full text-xs font-bold"
                >
                  {tag.title}
                </Link>
              ))}
            </section>
          )}
        </div>
        <div className="mx-auto pb-4 max-w-3xl px-2 sm:px-4">
          <BioBar author={post.user} />
          {post.showComments ? (
            <CommentsArea
              postId={post.id}
              postOwnerId={post.userId}
              slug={slug}
            />
          ) : (
            <h3 className="py-10 italic text-lg">
              Comments are disabled for this post
            </h3>
          )}
        </div>
      </>

      {session && session?.user?.role === "ADMIN" && (
        <ArticleAdminPanel session={session} postId={post.id} />
      )}
    </>
  );
};

export default ArticlePage;
