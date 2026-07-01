import type { ProductPublic } from '@barriapp/api-client';
import { cartCount, cartSubtotal, useCart } from './cart';

function product(id: string, price: number): ProductPublic {
  return {
    id,
    store_id: 's1',
    name: `P${id}`,
    description: null,
    image_url: null,
    category_id: null,
    price,
    compare_at_price: null,
    stock: null,
    unit: 'und',
    is_available: true,
    tags: [],
  } as ProductPublic;
}

beforeEach(() => useCart.setState({ storeId: null, lines: {} }));

describe('cart store', () => {
  it('adds a product and increments its quantity', () => {
    useCart.getState().add('s1', product('a', 1000));
    useCart.getState().add('s1', product('a', 1000));
    const { storeId, lines } = useCart.getState();
    expect(storeId).toBe('s1');
    expect(lines['a']!.qty).toBe(2);
    expect(cartCount(lines)).toBe(2);
    expect(cartSubtotal(lines)).toBe(2000);
  });

  it('resets the cart when adding from a different store', () => {
    useCart.getState().add('s1', product('a', 1000));
    useCart.getState().add('s2', product('b', 500));
    const { storeId, lines } = useCart.getState();
    expect(storeId).toBe('s2');
    expect(Object.keys(lines)).toEqual(['b']);
  });

  it('removes a line when its quantity drops to zero', () => {
    useCart.getState().add('s1', product('a', 1000));
    useCart.getState().setQty('a', 0);
    expect(useCart.getState().lines['a']).toBeUndefined();
    expect(useCart.getState().storeId).toBeNull();
  });
});
