import { Newspaper } from "lucide-react";
import { useState } from "react";
import EmptyState from "src/view/shared/EmptyState";

interface Article {
  id: string;
  title: string;
  summary: string;
}

// Demo feed: there is no news source yet, so a refresh always comes back empty.
const fetchNews = async (): Promise<Article[]> => [];

export default function NewsPage() {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      setArticles(await fetchNews());
      setChecked(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-title">
        <span className="title-icon">
          <Newspaper />
        </span>
        <div>
          <h1>Market News</h1>
          <small>Live financial news &amp; market updates · Demo feed</small>
        </div>
      </div>
      <div className="table-toolbar">
        <span>
          <Newspaper size={17} /> Market News
        </span>
        <button disabled={loading} onClick={refresh}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {loading ? (
        <div className="loading">Checking demo feed…</div>
      ) : articles.length ? (
        articles.map((article) => (
          <article key={article.id} className="panel page-padding">
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
          </article>
        ))
      ) : (
        <EmptyState
          icon={<Newspaper size={30} />}
          heading="No News Available"
          description={checked ? "Demo feed checked. No articles available." : undefined}
        />
      )}
    </div>
  );
}
