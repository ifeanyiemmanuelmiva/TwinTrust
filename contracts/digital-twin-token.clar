(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INSUFFICIENT-BALANCE u101)
(define-constant ERR-INSUFFICIENT-STAKE u102)
(define-constant ERR-MAX-SUPPLY-REACHED u103)
(define-constant ERR-PAUSED u104)
(define-constant ERR-ZERO-ADDRESS u105)
(define-constant ERR-NOT-OWNER u106)
(define-constant ERR-INVALID-STATE u107)

;; Token metadata
(define-constant TOKEN-NAME "TwinTrust Asset Token")
(define-constant TOKEN-SYMBOL "TTAT")
(define-constant TOKEN-DECIMALS u6)
(define-constant MAX-SUPPLY u500000000) ;; max 500M tokens

(define-data-var admin principal tx-sender)
(define-data-var paused bool false)
(define-data-var total-supply uint u0)

(define-map balances principal uint)
(define-map staked-balances principal uint)
(define-map twin-owners uint principal)
(define-map twin-status uint (string-ascii 32))
(define-map twin-ipfs-hash uint (string-ascii 64))

(define-data-var twin-counter uint u0)

;; Private helpers
(define-private (is-admin) (is-eq tx-sender (var-get admin)))
(define-private (ensure-not-paused) (asserts! (not (var-get paused)) (err ERR-PAUSED)))

;; Admin functions
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (is-eq new-admin 'SP000000000000000000002Q6VF78)) (err ERR-ZERO-ADDRESS))
    (var-set admin new-admin)
    (ok true)
  )
)

(define-public (set-paused (pause bool))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set paused pause)
    (ok pause)
  )
)

;; Token functions
(define-public (mint (recipient principal) (amount uint))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (is-eq recipient 'SP000000000000000000002Q6VF78)) (err ERR-ZERO-ADDRESS))
    (let ((new-supply (+ (var-get total-supply) amount)))
      (asserts! (<= new-supply MAX-SUPPLY) (err ERR-MAX-SUPPLY-REACHED))
      (map-set balances recipient (+ amount (default-to u0 (map-get? balances recipient))))
      (var-set total-supply new-supply)
      (ok true)
    )
  )
)

(define-public (burn (amount uint))
  (begin
    (ensure-not-paused)
    (let ((balance (default-to u0 (map-get? balances tx-sender))))
      (asserts! (>= balance amount) (err ERR-INSUFFICIENT-BALANCE))
      (map-set balances tx-sender (- balance amount))
      (var-set total-supply (- (var-get total-supply) amount))
      (ok true)
    )
  )
)

(define-public (transfer (recipient principal) (amount uint))
  (begin
    (ensure-not-paused)
    (asserts! (not (is-eq recipient 'SP000000000000000000002Q6VF78)) (err ERR-ZERO-ADDRESS))
    (let ((sender-balance (default-to u0 (map-get? balances tx-sender))))
      (asserts! (>= sender-balance amount) (err ERR-INSUFFICIENT-BALANCE))
      (map-set balances tx-sender (- sender-balance amount))
      (map-set balances recipient (+ amount (default-to u0 (map-get? balances recipient))))
      (ok true)
    )
  )
)

(define-public (stake (amount uint))
  (begin
    (ensure-not-paused)
    (let ((balance (default-to u0 (map-get? balances tx-sender))))
      (asserts! (>= balance amount) (err ERR-INSUFFICIENT-BALANCE))
      (map-set balances tx-sender (- balance amount))
      (map-set staked-balances tx-sender (+ amount (default-to u0 (map-get? staked-balances tx-sender))))
      (ok true)
    )
  )
)

(define-public (unstake (amount uint))
  (begin
    (ensure-not-paused)
    (let ((stake-balance (default-to u0 (map-get? staked-balances tx-sender))))
      (asserts! (>= stake-balance amount) (err ERR-INSUFFICIENT-STAKE))
      (map-set staked-balances tx-sender (- stake-balance amount))
      (map-set balances tx-sender (+ amount (default-to u0 (map-get? balances tx-sender))))
      (ok true)
    )
  )
)

;; Twin functions
(define-public (register-twin (ipfs-hash (string-ascii 64)))
  (begin
    (ensure-not-paused)
    (let ((twin-id (+ u1 (var-get twin-counter))))
      (map-set twin-owners twin-id tx-sender)
      (map-set twin-ipfs-hash twin-id ipfs-hash)
      (map-set twin-status twin-id "commissioned")
      (var-set twin-counter twin-id)
      (ok twin-id)
    )
  )
)

(define-public (update-twin-status (twin-id uint) (new-status (string-ascii 32)))
  (begin
    (ensure-not-paused)
    (asserts! (is-eq (default-to 'SP000000000000000000002Q6VF78 (map-get? twin-owners twin-id)) tx-sender) (err ERR-NOT-OWNER))
    (map-set twin-status twin-id new-status)
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-balance (account principal))
  (ok (default-to u0 (map-get? balances account)))
)

(define-read-only (get-staked (account principal))
  (ok (default-to u0 (map-get? staked-balances account)))
)

(define-read-only (get-total-supply) (ok (var-get total-supply)))
(define-read-only (get-admin) (ok (var-get admin)))
(define-read-only (is-paused) (ok (var-get paused)))
(define-read-only (get-twin-owner (twin-id uint)) (ok (map-get? twin-owners twin-id)))
(define-read-only (get-twin-status (twin-id uint)) (ok (map-get? twin-status twin-id)))
(define-read-only (get-twin-ipfs (twin-id uint)) (ok (map-get? twin-ipfs-hash twin-id)))
