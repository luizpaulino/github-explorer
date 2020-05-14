import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

import api from '../../services/api';
import logoImg from '../../assets/logo.svg';
import {
  Title, Form, Repositories, Error,
} from './styles';

interface Repository {
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
}

const Dashboard: React.FC = () => {
  const [newRepository, setNewRepository] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>((): Repository[] => {
    const storagedRepositories = localStorage.getItem('@GithubExplorer:repositories');

    if (storagedRepositories) {
      return JSON.parse(storagedRepositories);
    }

    return [];
  });
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    localStorage.setItem('@GithubExplorer:repositories', JSON.stringify(repositories));
  }, [repositories]);

  async function handleAddRepository(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!newRepository) {
      setInputError('Digite autor/nome de um repositorio válido');
      return;
    }

    try {
      const response = await api.get<Repository>(`/repos/${newRepository}`);
      setRepositories([...repositories, response.data]);
      setNewRepository('');
      setInputError('');
    } catch (err) {
      setInputError('Erro na busca pelo repositório :(');
    }
  }

  return (
    <>
      <img src={logoImg} alt="Github explorer" />
      <Title>Explore repositórios no Github</Title>

      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          value={newRepository}
          onChange={(e) => setNewRepository(e.target.value)}
          type="text"
          placeholder="Digite aqui"
        />
        <button type="submit">Pesquisar</button>
      </Form>

      { inputError && <Error>{ inputError }</Error> }

      <Repositories>
        {
          repositories.map((repository) => (
            <Link key={repository.full_name} to={`/repository/${repository.full_name}`}>
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
              />
              <div>
                <strong>{repository.full_name}</strong>
                <p>{repository.description}</p>
              </div>

              <FiChevronRight size={20} />
            </Link>
          ))
        }
      </Repositories>

    </>
  );
};

export default Dashboard;
