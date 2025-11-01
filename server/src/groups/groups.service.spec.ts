/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';

describe('GroupsService', () => {
  let service: GroupsService;
  let repo: jest.Mocked<Repository<Group>>;

  const mockGroup: Group = {
    id: 1,
    name: 'Test Group',
    start: 10,
    end: 20,
  };

  // Создаём частичный мок и приводим к jest.Mocked<Repository<Group>>
  const partialMockRepo: Partial<Record<keyof Repository<Group>, jest.Mock>> = {
    create: jest.fn((dto: Partial<Group>) => dto as Group),
    save: jest.fn().mockResolvedValue(mockGroup),
    find: jest.fn().mockResolvedValue([mockGroup]),
    findOne: jest.fn().mockResolvedValue(mockGroup),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockRepo = partialMockRepo as unknown as jest.Mocked<Repository<Group>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: getRepositoryToken(Group), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    repo = module.get(getRepositoryToken(Group));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a group', async () => {
    const dto = { name: 'Test Group', start: 10, end: 20 };
    const result = await service.create(dto);
    // проверяем, что save вызван с объектом, содержащим поля dto
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining(dto));
    expect(result).toEqual(mockGroup);
  });

  it('should return all groups', async () => {
    const result = await service.findAll();
    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual([mockGroup]);
  });

  it('should return a group by id', async () => {
    const result = await service.findOne(1);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(mockGroup);
  });

  it('should delete a group', async () => {
    const result = await service.remove(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ affected: 1 });
  });
});
