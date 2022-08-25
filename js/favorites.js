// usar git

import { GithubUser } from './GithubUser.js'

// Classe para fazer a estruturação dos dados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.rows = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.rows))
  }

  async add(username) {
    try {
      const isRowDuplicated = this.rows.find(row => row.login === username)

      if (isRowDuplicated) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado')
      }

      this.rows = [user, ...this.rows]
      this.update()
      this.verifyFavoritesEmptyTable()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.rows.filter(row => row.login !== user.login)
    this.rows = filteredEntries
    this.update()
    this.save()
  }
}

// Classe para criar a visualização do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
    this.verifyFavoritesEmptyTable()
  }

  clearInput() {
    this.root.querySelector('.search input').value = ''
  }

  onadd() {
    const addBtn = this.root.querySelector('.favorites')

    addBtn.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value)
      this.clearInput()
    }
  }

  update() {
    this.removeAllTr()

    this.rows.forEach(user => {
      const row = this.createRow()
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const confirmDelete = confirm(
          'Tem certeza que deseja deletar essa linha?'
        )
        if (confirmDelete) {
          this.delete(user)
        }
        this.verifyFavoritesEmptyTable()
      }

      this.tbody.append(row)
    })
  }

  verifyFavoritesEmptyTable() {
    const rowCount = this.rows.length

    if (rowCount == 0) {
      this.root.querySelector('.filled').classList.add('hide')
      this.root.querySelector('.empty').classList.remove('hide')
    }
    if (rowCount !== 0) {
      this.root.querySelector('.filled').classList.remove('hide')
      this.root.querySelector('.empty').classList.add('hide')
    }
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <td class="user">
        <img src="https://github.com/maykbrito.png" alt="Imagem de Mayk Brito">
        <a href="https://github.com/maykbrito" target="_blank">
            <p>Mayk Brito</p>
            <span>/maykbrito</span>
        </a>
    </td>
    <td class="repositories">123</td>
    <td class="followers">123</td>
    <td>
        <button class="remove">
            Remover
        </button>
    </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
