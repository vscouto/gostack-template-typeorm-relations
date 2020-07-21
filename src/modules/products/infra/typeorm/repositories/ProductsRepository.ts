import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsIds = products.map(product => product.id);
    const findProducts = await this.ormRepository.find({
      id: In(productsIds),
    });

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProducts: Product[] = [];

    const findProducts = products.map(product => ({ id: product.id }));

    const foundProducts = await this.findAllById(findProducts);

    const updateProducts = products.map(product => {
      const updateProduct = foundProducts.find(prod => prod.id === product.id);

      if (updateProduct) {
        updateProduct.quantity -= product.quantity;
      }

      return updateProduct as Product;
    });

    const promises = updateProducts.map(async product =>
      this.ormRepository.save(product),
    );

    Promise.all(promises);

    return updatedProducts;
  }
}

export default ProductsRepository;
