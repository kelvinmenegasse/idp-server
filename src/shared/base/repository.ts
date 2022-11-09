import { Observable } from 'rxjs';
import { EntityM } from './entity';

export abstract class RepositoryM<TEntity extends EntityM> {
  abstract create(data: TEntity): Observable<TEntity>;
  abstract update(id: number, data: TEntity): Observable<TEntity>;
  abstract getById(id: number): Observable<TEntity>;
  abstract getAll(): Observable<TEntity[]>;
  abstract getOne(filter: Partial<TEntity>): Observable<TEntity>;
  abstract getMany(filter: Partial<TEntity>): Observable<TEntity[]>;
  abstract softDelete(id: number): Observable<TEntity>;
  abstract restore(id: number): Observable<TEntity>;
  abstract hardDelete(id: number): Observable<TEntity>;
}
