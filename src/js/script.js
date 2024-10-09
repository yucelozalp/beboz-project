$(document).ready(function () {
    let g_selectedPersonCount;
    let g_selectedDate;
    let g_selectedTime;
    let g_selectedCustomType;
    let g_selectedCustomText;
    let g_selectedOrderNumber;
    let g_editBookingFlag = false;

    const bookingSystem = {

        init: function () {
            this.bindEvents();
            this.checkForOrderNumber();
        },

        bindEvents: function () {
            $('.customisation-item').click((event) => this.selectCustomization(event));
            $('.hamburger').click((event) => this.hamburgerMenu(event));
            window.selectPerson = (person) => this.selectPerson(person);
            window.selectTime = (time) => this.selectTime(time);
            window.sendBooking = () => this.sendBooking();
            window.redirectBookingEdit = () => this.redirectBookingEdit();
            window.openModalDeleteOrder = () => this.openModalDeleteOrder();
            window.openModalEditBooking = () => this.openModalEditBooking();
            window.openModalDeleteConfirmOrder = () => this.openModalDeleteConfirmOrder();
            window.closeModalDeleteConfirmOrder = () => this.closeModalDeleteConfirmOrder();
            window.closeModalDeleteOrder = () => this.closeModalDeleteOrder();
            window.closeModalSuccessOrder = () => this.closeModalSuccessOrder();
            window.deleteOrder = () => this.deleteOrder();
        },

        selectPerson: function (person) {
            $("#tab1 > div.tab-header > div.x-right > span").hide();
            $("#tab1 > div.tab-header > div.x-right > .selected").show().find('.text').text(person);
            this.g_selectedPersonCount = person;
            tabSysInstance.nextTab();
        },

        selectTime: function (time) {
            $("#tab3 > div.tab-header > div.x-right > span").hide();
            $("#tab3 > div.tab-header > div.x-right > .selected").show().find('.text').text(time);
            this.g_selectedTime = time;
            tabSysInstance.nextTab();
        },

        notifySend: function (status, title, text) {
            new Notify({
                status: status,
                title: title,
                text: text,
                effect: 'fade',
                speed: 300,
                customClass: 'notifySend',
                showIcon: true,
                showCloseButton: true,
                autoclose: true,
                autotimeout: 3000,
                type: 'outline',
                position: 'right top',
            });
        },

        sendBooking: function () {
            if (!this.g_selectedPersonCount) {
                this.scrollToTab(1, "Lütfen kişi bilgisi seçiniz.");
            } else if (!g_selectedDate) {
                this.scrollToTab(2, "Lütfen rezervasyon tarihi seçiniz.");
            } else if (!this.g_selectedTime) {
                this.scrollToTab(3, "Lütfen rezervasyon saati seçiniz.");
            } else if (!this.g_selectedCustomType) {
                this.scrollToTab(4, "Lütfen özelleştirin.");
            } else {
                const name = $('#name').val().trim();
                const surname = $('#surname').val().trim();
                const phone = $('#phone').val().trim();
                const email = $('#email').val().trim();
                const agree = $('#agree').is(':checked');

                if (g_editBookingFlag) {
                    if (this.validateInputs(name, surname, phone, email, agree)) {
                        let hiddenOrderValue = $('#orderNumber').val();
                        const order = this.createOrder(name, surname, phone, email);
                        this.saveOrderToStorage(order, hiddenOrderValue);
                        this.openModalSuccessOrder(order, hiddenOrderValue);
                    }
                } else {
                    if (this.validateInputs(name, surname, phone, email, agree)) {
                        const order = this.createOrder(name, surname, phone, email);
                        const generateOrderNumber = 'ORD-' + new Date().getTime();
                        this.saveOrderToStorage(order, generateOrderNumber);
                        this.openModalSuccessOrder(order, generateOrderNumber);
                    }
                }
            }
        },

        redirectBookingEdit: function () {
            const orderNumber = $('#booking-code').val().trim();

            if (orderNumber) {
                const redirectUrl = `/rezerve.html?orderNumber=${orderNumber}`;
                window.location.href = redirectUrl;
            } else {
                this.notifySend('warning', "Uyarı!", "Lütfen rezervasyon kodunu giriniz.");
            }
        },

        scrollToTab: function (tabIndex, message) {
            $(`#tab${tabIndex}`).get(0).scrollIntoView({ behavior: 'smooth' });
            this.notifySend('warning', "Uyarı!", message);
        },

        validateInputs: function (name, surname, phone, email, agree) {
            if (name.length < 3 || surname.length < 3 || phone.length < 3 || email.length < 3) {
                this.notifySend('warning', "Uyarı!", "Lütfen seçili alanları kontrol edin!");
                return false;
            } else if (!agree) {
                this.notifySend('warning', "Uyarı!", "Lütfen KVKK metnini kabul edin!");
                return false;
            }
            return true;
        },

        createOrder: function (name, surname, phone, email) {
            return {
                personCount: this.g_selectedPersonCount,
                date: g_selectedDate,
                time: this.g_selectedTime,
                customizationType: this.g_selectedCustomType,
                customizationText: this.g_selectedCustomText,
                name: name,
                surname: surname,
                email: email,
                phone: phone,
                orderNumber: $('#orderNumber').val(),
            };
        },

        openModalSuccessOrder: function (order, generateOrderNumber) {
            const date = new Date(order.date);
            const formattedDate = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const modal = document.getElementById("b-success-booking");

            $("#bookingCode").text(generateOrderNumber);
            $("#optionDate").text(formattedDate);
            $("#optionTime").text(order.time);
            $("#optionPerson").text(order.personCount);
            g_selectedOrderNumber = generateOrderNumber;
            modal.classList.add("show");
        },

        closeModalSuccessOrder: function (reload) {
            const modal = document.getElementById("b-success-booking");
            modal.classList.remove("show");

            if (reload != true) {
                location.reload();
            }
        },

        openModalDeleteOrder: function () {
            this.closeModalSuccessOrder(true);
            const modal = document.getElementById("b-cancel-booking");
            console.log("g_selectedOrderNumber", g_selectedOrderNumber);
            modal.classList.add("show");
        },

        openModalEditBooking: function() {
            this.hamburgerMenu();
            const modal = document.getElementById("edit-order-booking");
            console.log("g_selectedOrderNumber", g_selectedOrderNumber);
            modal.classList.add("show");
        },

        closeModalDeleteOrder: function (reload) {
            const modal = document.getElementById("b-cancel-booking");
            modal.classList.remove("show");
            if (reload != true) {
                location.reload();
            }
        },

        openModalDeleteConfirmOrder: function () {
            this.closeModalDeleteOrder(true);
            const modal = document.getElementById("b-cancel-confirm-booking");
            modal.classList.add("show");
        },

        closeModalDeleteConfirmOrder: function () {
            const modal = document.getElementById("b-cancel-confirm-booking");
            modal.classList.remove("show");
            location.reload();
        },

        saveOrderToStorage: function (order, orderNumber) {
            let orders = JSON.parse(localStorage.getItem('orders')) || [];

            order.orderNumber = orderNumber;

            let orderIndex = orders.findIndex(existingOrder => existingOrder.orderNumber === orderNumber);

            if (orderIndex !== -1) {
                orders[orderIndex] = order;
                console.log(`Sipariş ${orderNumber} güncellendi.`);
            } else {
                orders.push(order);
                console.log(`Yeni sipariş ${orderNumber} oluşturuldu.`);
            }

            localStorage.setItem('orders', JSON.stringify(orders));
        },

        deleteOrder: function () {
            this.deleteOrderByOrderNumber(g_selectedOrderNumber);
        },

        deleteOrderByOrderNumber: function (orderNumber) {
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            const orderIndex = orders.findIndex(order => order.orderNumber === orderNumber);

            if (orderIndex !== -1) {
                orders.splice(orderIndex, 1);
                localStorage.setItem('orders', JSON.stringify(orders));
                openModalDeleteConfirmOrder();
                console.log(`Sipariş ${orderNumber} başarıyla silindi.`);
            } else {
                console.error(`Hata: Sipariş numarası ${orderNumber} ile eşleşen bir sipariş bulunamadı.`);
            }
        },

        selectCustomization: function (event) {
            $('.customisation-item').removeClass('selected');
            $(event.currentTarget).addClass('selected');

            this.g_selectedCustomType = $(event.currentTarget).data('id');
            $("#tab4 > div.tab-header > div.x-right > span").hide();
            $("#tab4 > div.tab-header > div.x-right > .selected").show().find('.text').text("Özelleştirildi");
            tabSysInstance.nextTab();
        },

        hamburgerMenu: function (event) {
            $('.menu.mobile').toggleClass('active');
            $('.hamburger').toggleClass('active');
        },

        getOrderNumberFromURL: function () {
            const params = new URLSearchParams(window.location.search);
            return params.get('orderNumber');
        },

        findOrderByOrderNumber: function (orderNumber) {
            let orders = JSON.parse(localStorage.getItem('orders')) || [];

            let order = orders.find(order => order.orderNumber === orderNumber);

            if (order) {
                console.log(`Sipariş ${orderNumber} bulundu:`);
                $("body > div.b-booking.b-container > div.left > div.booking-cap > div > h1").text(`${orderNumber} numaralı siparişinizi düzenleyebilirsiniz.`);
                $("#orderNumber").val(orderNumber);
                g_editBookingFlag = 1;
                console.log(order);
            } else {
                console.error(`Hata: Sipariş numarası ${orderNumber} ile eşleşen bir sipariş bulunamadı.`);
                this.notifySend('warning', "Hata!", `Sipariş numarası ${orderNumber} ile eşleşen bir sipariş bulunamadı.`);
            }
        },

        checkForOrderNumber: function () {
            const orderNumber = this.getOrderNumberFromURL();
            if (orderNumber) {
                this.findOrderByOrderNumber(orderNumber);
            }
        }
    };

    const tabSysInstance = {
        currentTab: 1,

        showTab: function (tabIndex) {
            $('.tab').removeClass('active');
            $('.tab-content').hide();
            $(`#tab${tabIndex}`).addClass('active').removeClass('disabled');
            $(`#tab${tabIndex} .tab-content`).fadeIn(300);
        },

        resetSubsequentTabs: function (tabIndex) {
            $('.tab').each(function () {
                const tabId = $(this).attr('id').replace('tab', '');
                if (tabId > tabIndex) {
                    //console.log(tabId);
                    $(this).removeClass('completed').addClass('disabled');
                    console.log("#tab" + tabId + " > div.tab-header > div.x-right > span");
                    $("#tab" + tabId + " > div.tab-header > div.x-right > span").css("display", "block");
                    $("#tab" + tabId + " > div.tab-header > div.x-right > .selected").css("display", "none");
                }
            });
        },

        nextTab: function () {
            $(`#tab${this.currentTab}`).addClass('completed');
            this.resetSubsequentTabs(this.currentTab);
            if (this.currentTab < 5) {
                this.currentTab++;
                this.showTab(this.currentTab);
            }
            $(`#tab${this.currentTab}`).get(0).scrollIntoView({ behavior: 'smooth' });
        },

        init: function () {
            this.showTab(this.currentTab);
            $('.next-btn').click(() => {
                this.nextTab();
            });
            $('.edit-btn').click(function () {
                const tabIndex = $(this).closest('.tab').attr('id').replace('tab', '');
                tabSysInstance.currentTab = tabIndex;
                tabSysInstance.showTab(tabIndex);
                tabSysInstance.resetSubsequentTabs(tabIndex);
                $(`#tab${tabIndex}`).get(0).scrollIntoView({ behavior: 'smooth' });
                $(`#tab${tabIndex}`).removeClass('completed');
            });
        }
    };

    const Calendar = {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        today: new Date(),
        bookedDays: [],
        selectedDateObj: null,

        init: function () {
            this.cacheDOM();
            this.bindEvents();
            this.renderCalendar(this.currentMonth, this.currentYear);
        },

        cacheDOM: function () {
            this.$daysContainer = $("#days");
            this.$monthName = $("#month-name");
            this.$prevMonth = $("#prev-month");
            this.$nextMonth = $("#next-month");
            this.$selectedDateDiv = $("#selected");
            this.$notSelectedDiv = $("#not-selected");
            this.selectedDate = null;
        },

        bindEvents: function () {
            this.$prevMonth.on('click', this.prevMonth.bind(this));
            this.$nextMonth.on('click', this.nextMonth.bind(this));
            this.$daysContainer.on('click', '.available', this.handleDateClick.bind(this));
        },

        renderCalendar: function (month, year) {
            this.$daysContainer.empty();
            let firstDay = new Date(year, month).getDay();
            let daysInMonth = new Date(year, month + 1, 0).getDate();

            const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
            this.$monthName.text(`${monthNames[month]} ${year}`);

            this.generateRandomBookedDays(daysInMonth);

            for (let date = 1; date <= daysInMonth; date++) {
                let dayItem = $('<div class="day-item"></div>');
                let daySpan = $(`<span>${date}</span>`);

                if (this.bookedDays.includes(date)) {
                    dayItem.addClass("booked");
                    dayItem.append('<i class="booked-s">Dolu</i>');
                } else {
                    dayItem.addClass("available");
                }

                dayItem.append(daySpan);


                if (this.selectedDateObj && this.selectedDateObj.day === date && this.selectedDateObj.month === month && this.selectedDateObj.year === year) {
                    dayItem.addClass("selected");
                    this.selectedDate = dayItem;
                }

                this.$daysContainer.append(dayItem);
            }


            if (month === this.today.getMonth() && year === this.today.getFullYear()) {
                this.$prevMonth.prop('disabled', true);
            } else {
                this.$prevMonth.prop('disabled', false);
            }
        },

        generateRandomBookedDays: function (daysInMonth) {
            this.bookedDays = [];
            const randomBookedDaysCount = Math.floor(Math.random() * 3) + 3;
            while (this.bookedDays.length < randomBookedDaysCount) {
                let randomDay = Math.floor(Math.random() * daysInMonth) + 1;
                if (!this.bookedDays.includes(randomDay)) {
                    this.bookedDays.push(randomDay);
                }
            }
        },

        handleDateClick: function (event) {
            const selectedDate = parseInt($(event.target).text());
            const selectedMonth = this.currentMonth;
            const selectedYear = this.currentYear;


            if (this.selectedDate) {
                this.selectedDate.removeClass("selected");
            }


            const clickedDay = $(event.target).closest('.day-item');
            clickedDay.addClass("selected");
            this.selectedDate = clickedDay;


            this.selectedDateObj = { day: selectedDate, month: selectedMonth, year: selectedYear };


            const formattedDate = new Date(this.selectedDateObj.year, this.selectedDateObj.month, this.selectedDateObj.day);
            this.updateSelectedDateDisplay(formattedDate);
            console.log(formattedDate);
            g_selectedDate = formattedDate;
            tabSysInstance.nextTab();
        },

        updateSelectedDateDisplay: function (date) {
            this.$notSelectedDiv.hide();
            this.$selectedDateDiv.show();
            this.$selectedDateDiv.find('.text').text(`${date.toLocaleDateString()}`);
        },

        nextMonth: function () {
            this.currentMonth = (this.currentMonth + 1) % 12;
            if (this.currentMonth === 0) this.currentYear++;
            this.animateCalendarTransition();
            this.renderCalendar(this.currentMonth, this.currentYear);
        },

        prevMonth: function () {
            if (this.currentMonth > this.today.getMonth() || this.currentYear > this.today.getFullYear()) {
                this.currentMonth = (this.currentMonth - 1 + 12) % 12;
                if (this.currentMonth === 11) this.currentYear--;
                this.animateCalendarTransition();
                this.renderCalendar(this.currentMonth, this.currentYear);
            }
        },

        animateCalendarTransition: function () {
            this.$daysContainer.addClass('animate__animated animate__fadeOut');
            setTimeout(() => {
                this.$daysContainer.removeClass('animate__animated animate__fadeOut');
                this.$daysContainer.addClass('animate__animated animate__fadeIn');
            }, 200);
        }
    };

    function inputSys() {
        const maxLength = 120;
        $('#additional-inform-inp').on('input', function () {
            const currentLength = $(this).val().length;
            const remainingLength = maxLength - currentLength;
            $('#remaining').text(remainingLength);
        });
    }


    tabSysInstance.init();
    inputSys();
    Calendar.init();
    bookingSystem.init();
});
