import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';

const Home = ({ lights }) => {
  const totalLight = Object.values(lights).reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen pb-12">
      <header className="relative py-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif text-gradient mb-4">
            <a href={import.meta.env.BASE_URL} onClick={() => window.location.href = import.meta.env.BASE_URL}>Shen'Storey</a>
          </h1>
          <p className="text-memory-glow/60 text-sm tracking-widest uppercase">
            2014-2026
          </p>
        </motion.div>

        <motion.div
          className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-memory-card/50 surreal-border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-memory-accent text-lg">✧</span>
          <span className="text-memory-glow text-sm">
            已收集的记忆碎片：{' '}
            <span className="text-memory-accent font-medium">{totalLight}</span>
          </span>
        </motion.div>
      </header>

      <main className="px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
            >
              <ProductCard
                product={product}
                light={lights[product.id] || 0}
                index={index}
                lights={lights}
              />
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="mt-16 text-center px-6">
        <p className="text-memory-muted/50 text-xs tracking-wider">
          不朽的 没有了 没人记得
        </p>
      </footer>
    </div>
  );
};

export default Home;