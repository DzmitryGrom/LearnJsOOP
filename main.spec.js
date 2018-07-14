describe('patterns', function () {

  describe('Generative', function () {
    it('Singleton', function () {

      window.MyApp = {
        userService: new UserService,
        repositoryService: new InMemoryRepositoryService

      };

      function UserService() {
        var self = this,
            namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/,
            numbPattern = /[0-9]+/g;

        repositoryService = function () {
          return window.MyApp.repositoryService;
        };

        self.create = function (id, user) {
          if (myTypeOf(id) !== 'number' ||
            myTypeOf(user) !== 'object') {
            throw new Error('Type mistake');
          }
          if (myTypeOf(id) === 'undefined') {
            throw new Error('Id undefined');
          }

          if (myTypeOf(user.name) !== 'string') {
            throw new Error('user.name toBe string');
          }

          if (!namePattern.test(user.name)) {
            throw new Error('Not valid');
          }

          return repositoryService().save(id, user);

        };

        self.get = function (id) {
          var result = repositoryService().find(id);
          if (result === undefined || result.deleteDate !== undefined) {
            result = new Error('User not found by id:' + id);
          }

          return result;
        };

        self.find = function (id) {
          var result = repositoryService().find(id);
          if (result === undefined || result.deleteDate !== undefined) {
            result = new Error('User not found by id:' + id);
          }

          return result;
        };

        self.findAlls = function (ids) {

          if (myTypeOf(ids) === 'null') {
            throw new Error('not avalibal ids');
          }
          if (myTypeOf(ids) === 'object') {
            return repositoryService().findAll(ids);
          }
        };

        self.change = function (id, user) {
          if (!namePattern.test(user.name)) {
            throw new Error('Not valid name');
          }
          if (!numbPattern.test(id)) {
            throw new Error('Not valid name');
          }
          if (myTypeOf(id) !== 'number' || myTypeOf(user) !== 'object') {
            throw new Error('Type mistake');
          }
          return repositoryService().update(id, user);
        };

        self.delete = function (id, force) {
          var result;

          if (force) {
            result = repositoryService().delete(id);
          } else {
            result = repositoryService().find(id);

            if (result) {
              result.deleteDate = new Date;
              return repositoryService().save(id, result);
            }
          }

          if (!result) {
            throw new Error('User not found by id:' + id);
          }

          return result;
        };

        function myTypeOf(value) {
          var result;

          if (value === null) {
            result = 'null';
          } else {
            result = typeof value;
          }

          return result;
        }

      }

      function InMemoryRepositoryService() {
        var self = this,
            storage = {},
            numbPattern = /[0-9]+/g;

        self.save = function (id, data) {
          var result;
          if (typeof id != 'number' && typeof data != 'Object') {
            result = new Error('Type mistake');
          } else {
            storage[id] = Object.assign({}, data);

            result = storage[id];
          }

          return result;
        };

        self.find = function (id) {
          var result = storage[id];

          if (result) {
            result = Object.assign({}, result);
          }
          return result;

        };

        self.findAll = function (ids) {

          var result = [];
          if (ids === undefined) {
            for (key in storage) {
              result.push(storage[key]);
            }
          } else {
            for (var i = 0; i < ids.length; i++) {
              if (storage[ids[i]]) {
                result.push(storage[ids[i]]);
              }
            }
          }

          return result;

        };

        self.update = function (id, data) {
          if (storage[id]) {
            return storage[id] = Object.assign({}, data);
          }
        };

        self.delete = function (id) {
          if (!numbPattern.test(id)) {
            return new Error('Not valid');
          }
          var result = self.find(id);

          delete storage[id];

          return result;

        }

      }

      MyApp.userService.create(1, {name: 'Dzmitry Shaliaheika'});

      expect(MyApp.userService.find(1)).toEqual({name: 'Dzmitry Shaliaheika'});
      expect(MyApp.repositoryService.find(1)).not.toBe(undefined);
      expect(MyApp.repositoryService.find(1)).toEqual({name: 'Dzmitry Shaliaheika'});
      expect(MyApp.userService.get(2)).toEqual(new Error('User not found by id:2'));
      expect(MyApp.repositoryService.save('1', 1)).toEqual(new Error('Type mistake'));
      expect(function () {
        MyApp.userService.create(1, 'Dzmitry Shaliaheika');
      }).toThrow(new Error('Type mistake'));

      MyApp.userService.delete(1);
      expect(MyApp.userService.find(1)).not.toEqual({name: 'Dzmitry Shaliaheika'});

      MyApp.userService.create(1, {name: 'Dzmitry Shaliaheika'});
      MyApp.userService.create(2, {name: 'Petrov Igor'});
      MyApp.userService.create(3, {name: 'Buslov Pavel'});

      expect(MyApp.userService.findAlls([1, 2, 3])).toEqual([
        ({name: 'Dzmitry Shaliaheika'}),
        ({name: 'Petrov Igor'}),
        ({name: 'Buslov Pavel'})
      ]);

      expect(function () {
        MyApp.userService.change(1, 'Dmitry Shelegeyko');
      }).toThrow(new Error('Not valid name'));

      MyApp.userService.change(1, {name: 'Dmitry Shelegeyko'});
      expect(MyApp.repositoryService.find(1)).toEqual({name: 'Dmitry Shelegeyko'});
      MyApp.userService.delete(1);
      MyApp.userService.delete(2);
      MyApp.userService.delete(3);
      expect(MyApp.repositoryService.findAll(1, 2, 3)).not.toEqual(
        [
          ({name: 'Dzmitry Shaliaheika'}),
          ({name: 'Petrov Igor'}),
          ({name: 'Buslov Pavel'})
        ]
      );

    });
  });

  describe('Inversion of Control', function () {
    it('Setter injection', function () {
      var userService = new UserService,
        repositoryService = new InMemoryRepositoryService;

      userService.setRepositoryService(repositoryService);

      function UserService() {
        var self = this,
            namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/,
            numbPattern = /[0-9]+/g,
            repositoryService;

        self.setRepositoryService = function (_repositoryService) {
          repositoryService = _repositoryService;
        };

        self.create = function (id, user) {
          if (myTypeOf(id) !== 'number' ||
            myTypeOf(user) !== 'object') {
            throw new Error('Type mistake');
          }
          if (myTypeOf(id) === 'undefined') {
            throw new Error('Id undefined');
          }

          if (myTypeOf(user.name) !== 'string') {
            throw new Error('user.name toBe string');
          }

          if (!namePattern.test(user.name)) {
            throw new Error('Not valid');
          }

          return repositoryService.save(id, user);

        };

        self.get = function (id) {
          var result = repositoryService.find(id);
          if (result === undefined || result.deleteDate !== undefined) {
            result = new Error('User not found by id:' + id);
          }

          return result;
        };

        self.find = function (id) {
          var result = repositoryService.find(id);
          if (result === undefined || result.deleteDate !== undefined) {
            result = new Error('User not found by id:' + id);
          }

          return result;
        };

        self.findAlls = function (ids) {

          if (myTypeOf(ids) === 'null') {
            throw new Error('not avalibal ids');
          }
          if (myTypeOf(ids) === 'object') {
            return repositoryService().findAll(ids);
          }
        };

        self.change = function (id, user) {
          if (!namePattern.test(user.name)) {
            throw new Error('Not valid name');
          }
          if (!numbPattern.test(id)) {
            throw new Error('Not valid name');
          }
          if (myTypeOf(id) !== 'number' || myTypeOf(user) !== 'object') {
            throw new Error('Type mistake');
          }
          return repositoryService.update(id, user);
        };

        self.delete = function (id, force) {
          var result;

          if (force) {
            result = repositoryService().delete(id);
          } else {
            result = repositoryService().find(id);

            if (result) {
              result.deleteDate = new Date;
              return repositoryService.save(id, result);
            }
          }

          if (!result) {
            throw new Error('User not found by id:' + id);
          }

          return result;
        };

        function myTypeOf(value) {
          var result;

          if (value === null) {
            result = 'null';
          } else {
            result = typeof value;
          }

          return result;
        }

      }

      function InMemoryRepositoryService() {
        var self = this,
            storage = {},
            numbPattern = /[0-9]+/g;

        self.save = function (id, data) {
          var result;
          if (typeof id != 'number' && typeof data != 'Object') {
            result = new Error('Type mistake');
          } else {
            storage[id] = Object.assign({}, data);

            result = storage[id];
          }

          return result;
        };

        self.find = function (id) {
          var result = storage[id];

          if (result) {
            result = Object.assign({}, result);
          }
          return result;

        };

        self.findAll = function (ids) {

          var result = [];
          if (ids === undefined) {
            for (key in storage) {
              result.push(storage[key]);
            }
          } else {
            for (var i = 0; i < ids.length; i++) {
              if (storage[ids[i]]) {
                result.push(storage[ids[i]]);
              }
            }
          }

          return result;

        };

        self.update = function (id, data) {
          if (storage[id]) {
            storage[id] = Object.assign({}, data);
          }
        }

        self.delete = function (id) {
          if (!numbPattern.test(id)) {
            return new Error('Not valid');
          }
          var result = self.find(id);

          delete storage[id];

          return result;

        }

      }

      userService.create(1, {name: 'Dzmitry Shaliaheika'});

      expect(repositoryService.find(1)).toEqual({name: 'Dzmitry Shaliaheika'});
      expect(repositoryService.find(1)).not.toBe(undefined);
      expect(userService.get(2)).toEqual(new Error('User not found by id:2'));
      expect(function () {
        userService.create(1, 'Dzmitry Shaliaheika');
      }).toThrow(new Error('Type mistake'));
      expect(repositoryService.delete(1)).toEqual({name: 'Dzmitry Shaliaheika'});
      expect(repositoryService.delete('1')).toEqual(new Error('Not valid'));
      expect(repositoryService.save('1', 1)).toEqual(new Error('Type mistake'));


      userService.create(1, {name: 'Dzmitry Shaliaheika'});
      userService.create(2, {name: 'Petrov Igor'});
      userService.create(3, {name: 'Buslov Pavel'});
      expect(repositoryService.findAll([1, 2, 3])).toEqual(
        [
          ({name: 'Dzmitry Shaliaheika'}),
          ({name: 'Petrov Igor'}),
          ({name: 'Buslov Pavel'})
        ]
      );


    });
  });

  describe('Decorator', function () {
    it('Decorator', function () {
      function InMemoryRepositoryService() {
        var self = this,
          storage = {},
          namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/;

        self.create = function (id, data) {
          var result;
          if (typeof id != 'number' && typeof data != 'Object') {
            throw new Error('Type mistake');
          }
          storage[id] = Object.assign({}, data);
        };

        self.find = function (id) {
          return storage[id];
        };

        self.findAll = function (ids) {

          var result = [];
          if (ids === undefined) {
            for (key in storage) {
              result.push(storage[key]);
            }
          } else {
            for (var i = 0; i < ids.length; i++) {
              if (storage[ids[i]]) {
                result.push(storage[ids[i]]);
              }
            }
          }

          return result;

        };

        self.update = function (id, data) {
          if (!namePattern.test(data.name)) {
            throw new Error('Not valid name');
          }

          if (validate(id) === 'undefined') {
            throw new Error('Type mistake');
          }
          storage[id] = Object.assign({}, data);
        }

        self.delete = function (id) {
          var result = self.find(id);

          delete storage[id];

          return result;
        }
      }

      function DataValidatorRepository(repository, validator) {
        var self = this;

        self.create = function (id, data) {
          if (typeof id != 'number' && typeof data != 'Object') {
            throw new Error('Type mistake');
          }
          repository.create(id, data);
        };

        self.find = function (id) {
          return repository.find(id);
        };

        self.findAll = function (ids) {
          return repository.findAll(ids);
        };

        self.update = function (id, data) {

          return repository.update(id, data);
        };

        self.delete = function (id) {
          return repository.delete(id);
        };
      }

      var inMemoryRepositoryService = new InMemoryRepositoryService,
        dataValidatorRepository = new DataValidatorRepository(inMemoryRepositoryService, validate);

      function validate(data) {
        var result;

        return typeof data.id === 'number';
      }

      inMemoryRepositoryService.create(1, {name: 'Dzmitry Shaliaheika'});
      expect(inMemoryRepositoryService.find(1)).toEqual({name: 'Dzmitry Shaliaheika'});

      expect(function () {
        inMemoryRepositoryService.create('2', 'Dzmitry Shaliaheika');
      }).toThrow();

      inMemoryRepositoryService.create(2, {name: 'Petrov Igor'});
      inMemoryRepositoryService.create(3, {name: 'Buslov Pavel'});

      expect(inMemoryRepositoryService.findAll([1, 2, 3])).toEqual(
        [
          ({name: 'Dzmitry Shaliaheika'}),
          ({name: 'Petrov Igor'}),
          ({name: 'Buslov Pavel'})
        ]
      );

      inMemoryRepositoryService.update(1, {name: 'Dmitry Shelegeyko'});
      expect(inMemoryRepositoryService.find(1)).toEqual({name: 'Dmitry Shelegeyko'});
      inMemoryRepositoryService.delete(1);
      inMemoryRepositoryService.delete(2);
      inMemoryRepositoryService.delete(3);
      expect(inMemoryRepositoryService.findAll()).not.toEqual(
        [
          ({name: 'Dzmitry Shaliaheika'}),
          ({name: 'Petrov Igor'}),
          ({name: 'Buslov Pavel'})
        ]
      );

      expect(dataValidatorRepository.find(1)).toEqual(undefined);
      expect(dataValidatorRepository.find(2)).toEqual(undefined);
      expect(dataValidatorRepository.find(3)).toEqual(undefined);
      expect(dataValidatorRepository.find(8)).toEqual(undefined);
      dataValidatorRepository.create(8, {name: 'Nesterov Igor'});
      dataValidatorRepository.create(9, {name: 'Lavrushko Igor'});
      expect(dataValidatorRepository.find(8)).toEqual({name: 'Nesterov Igor'});
      expect(dataValidatorRepository.find(9)).toEqual({name: 'Lavrushko Igor'});
      expect(dataValidatorRepository.findAll([8, 9])).toEqual(
        [
          ({name: 'Nesterov Igor'}),
          ({name: 'Lavrushko Igor'})
        ]
      );

    });
  });

});