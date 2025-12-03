const Navbar = {
    components: {

    },
    props: {
        apiService: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            currentPage: 'home',
            pages: [
                { name: 'Home', key: 'home' },
                { name: 'History', key: 'history' },
                { name: 'Rules', key: 'rules' },
                { name: 'TUI', key: 'tui' }
            ]
        }
    },
    methods: {
        goto(link) {

        }
    },
    template: `
        <nav class="navbar navbar-expand-lg navbar-dark">
            <div class="container-fluid">

                <!-- logo -->
                <a class="navbar-brand d-flex align-items-center" href="/toGame">
                    <img src='assets/images/logo/blackjack_logo.png'
                    alt="Blackjack" class="img-fluid" style="max-height: 60px;">
                    <span class="ms-2 fw-bold">Blackjack</span>
                </a>

                <!-- toggle -->
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- links -->
                <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul class="navbar-nav gap-3">
                    
                        <li v-for="page in pages" class="nav-item">
                            <a class="nav-link nav-button" @click="goto(link)">{{page.name}}</a>
                        </li>
                      
                    </ul>
                </div>
            </div>
        </nav>
    `
}